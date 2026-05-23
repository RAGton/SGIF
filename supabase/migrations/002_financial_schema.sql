-- Contas (carteira, banco, cartão)
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('wallet', 'bank', 'credit_card', 'investment')),
    currency TEXT NOT NULL DEFAULT 'BRL',
    initial_balance BIGINT NOT NULL DEFAULT 0,  -- centavos
    current_balance BIGINT NOT NULL DEFAULT 0,  -- centavos
    color TEXT DEFAULT '#6C63FF',
    icon TEXT DEFAULT 'wallet',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categorias
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'tag',
    color TEXT DEFAULT '#6C63FF',
    category_type TEXT NOT NULL CHECK (category_type IN ('income', 'expense')),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transações
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount BIGINT NOT NULL,  -- centavos (positivo=entrada, negativo=saída)
    description TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_account ON public.transactions(account_id);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_accounts_user ON public.accounts(user_id);
CREATE INDEX idx_categories_user ON public.categories(user_id);

-- RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_own" ON public.accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "categories_own" ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "transactions_own" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Trigger para atualizar balance ao inserir transação
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.accounts SET current_balance = current_balance + NEW.amount, updated_at = NOW()
        WHERE id = NEW.account_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.accounts SET current_balance = current_balance - OLD.amount, updated_at = NOW()
        WHERE id = OLD.account_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.amount != NEW.amount THEN
        UPDATE public.accounts SET current_balance = current_balance - OLD.amount + NEW.amount, updated_at = NOW()
        WHERE id = NEW.account_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_change
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();
