# Personal Finance Management System - Technical Design

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 Application                   │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Client Side    │    │  Server Side    │                │
│  │  Components     │◄──►│  API Routes     │                │
│  │  (App Router)   │    │  Server Actions │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   PostgreSQL    │  │  Authentication │  │  Real-time  │ │
│  │   Database      │  │     & Auth      │  │ Subscriptions│ │
│  │                 │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

**Frontend & Backend (Full-Stack):**
- Next.js 14 with App Router
- TypeScript for complete type safety
- Tailwind CSS for styling
- Shadcn/ui for component library
- Recharts for Kaizen progress visualization
- React Hook Form for form management

**Backend Services:**
- Supabase for database and authentication
- Supabase Edge Functions for complex business logic
- Supabase Real-time for live updates
- Row Level Security (RLS) for data protection

**Database:**
- PostgreSQL (managed by Supabase)
- Supabase migrations for schema management

**Development Tools:**
- ESLint and Prettier for code formatting
- Vitest for testing
- Vercel for deployment and hosting

## 2. Database Design

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      User       │    │  FinanceGroup   │    │  Transaction    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (UUID, PK)   │    │ id (UUID, PK)   │    │ id (UUID, PK)   │
│ email           │    │ user_id (FK)    │    │ user_id (FK)    │
│ created_at      │    │ name            │    │ group_id (FK)   │
│ updated_at      │    │ percentage      │    │ date            │
│ total_capital   │    │ capacity        │    │ concept         │
│                 │    │ accumulated_exp │    │ amount          │
│                 │    │ is_protected    │    │ type            │
│                 │    │ created_at      │    │ allocation_type │
│                 │    │ updated_at      │    │ created_at      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 Supabase Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    total_capital DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance groups table
CREATE TABLE public.finance_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    capacity DECIMAL(12,2) DEFAULT 0.00,
    accumulated_expenses DECIMAL(12,2) DEFAULT 0.00,
    is_protected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.finance_groups(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    concept TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    allocation_type TEXT CHECK (allocation_type IN ('specific', 'general', 'mixed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_group ON public.transactions(group_id);
CREATE INDEX idx_finance_groups_user ON public.finance_groups(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for finance_groups
CREATE POLICY "Users can view own groups" ON public.finance_groups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own groups" ON public.finance_groups
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);
```

### 2.3 Supabase Functions for Business Logic

```sql
-- Function to initialize default finance groups for new users
CREATE OR REPLACE FUNCTION public.initialize_user_finance_groups()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.finance_groups (user_id, name, percentage, is_protected) VALUES
    (NEW.id, 'cushion', 45.00, true),
    (NEW.id, 'personal_expenses', 15.00, false),
    (NEW.id, 'entertainment', 10.00, false),
    (NEW.id, 'investment_savings', 30.00, false);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default groups when user profile is created
CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.initialize_user_finance_groups();

-- Function to recalculate group capacities
CREATE OR REPLACE FUNCTION public.recalculate_group_capacities(
    p_user_id UUID,
    p_new_total_capital DECIMAL(12,2)
)
RETURNS VOID AS $$
BEGIN
    -- Update user's total capital
    UPDATE public.user_profiles 
    SET total_capital = p_new_total_capital,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Update group capacities based on percentages
    UPDATE public.finance_groups 
    SET capacity = (p_new_total_capital * percentage / 100),
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process expense transaction
CREATE OR REPLACE FUNCTION public.process_expense_transaction(
    p_user_id UUID,
    p_group_id UUID,
    p_amount DECIMAL(12,2),
    p_concept TEXT,
    p_date DATE
)
RETURNS JSON AS $$
DECLARE
    v_group RECORD;
    v_new_balance DECIMAL(12,2);
    v_transaction_id UUID;
BEGIN
    -- Get group information
    SELECT * INTO v_group 
    FROM public.finance_groups 
    WHERE id = p_group_id AND user_id = p_user_id;
    
    -- Check if group exists
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Group not found');
    END IF;
    
    -- Check if trying to use protected cushion
    IF v_group.is_protected THEN
        RETURN json_build_object('success', false, 'error', 'Cushion funds cannot be used for expenses');
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_group.capacity - v_group.accumulated_expenses - ABS(p_amount);
    
    -- Check if sufficient funds
    IF v_new_balance < 0 THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient funds in group');
    END IF;
    
    -- Create transaction
    INSERT INTO public.transactions (user_id, group_id, date, concept, amount, type)
    VALUES (p_user_id, p_group_id, p_date, p_concept, -ABS(p_amount), 'expense')
    RETURNING id INTO v_transaction_id;
    
    -- Update group accumulated expenses
    UPDATE public.finance_groups 
    SET accumulated_expenses = accumulated_expenses + ABS(p_amount),
        updated_at = NOW()
    WHERE id = p_group_id;
    
    RETURN json_build_object(
        'success', true, 
        'transaction_id', v_transaction_id,
        'new_available_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 3. Next.js 14 API Design

### 3.1 App Router Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── transactions/
│   │   └── page.tsx
│   ├── income/
│   │   └── page.tsx
│   └── analytics/
│       └── page.tsx
├── api/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts
│   ├── groups/
│   │   └── route.ts
│   ├── transactions/
│   │   └── route.ts
│   └── analytics/
│       └── route.ts
├── globals.css
├── layout.tsx
└── page.tsx
```

### 3.2 Server Actions (Next.js 14)

```typescript
// app/lib/actions/finance.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createTransaction(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const transaction = {
    user_id: user.id,
    group_id: formData.get('groupId') as string,
    date: formData.get('date') as string,
    concept: formData.get('concept') as string,
    amount: parseFloat(formData.get('amount') as string),
    type: formData.get('type') as 'income' | 'expense'
  }

  if (transaction.type === 'expense') {
    // Use Supabase function for expense processing
    const { data, error } = await supabase.rpc('process_expense_transaction', {
      p_user_id: user.id,
      p_group_id: transaction.group_id,
      p_amount: Math.abs(transaction.amount),
      p_concept: transaction.concept,
      p_date: transaction.date
    })

    if (error || !data.success) {
      throw new Error(data?.error || 'Failed to process expense')
    }
  } else {
    // Handle income transaction
    const { error } = await supabase
      .from('transactions')
      .insert(transaction)

    if (error) throw new Error('Failed to create income transaction')
  }

  revalidatePath('/dashboard')
  revalidatePath('/transactions')
}

export async function allocateIncome(
  totalAmount: number,
  allocations: Array<{
    type: 'specific' | 'general'
    groupId?: string
    amount: number
  }>
) {
  const supabase = createServerActionClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Process general recalculation first
  const generalAmount = allocations
    .filter(a => a.type === 'general')
    .reduce((sum, a) => sum + a.amount, 0)

  if (generalAmount > 0) {
    // Get current total capital
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_capital')
      .eq('id', user.id)
      .single()

    const newTotalCapital = (profile?.total_capital || 0) + generalAmount

    // Use Supabase function to recalculate capacities
    await supabase.rpc('recalculate_group_capacities', {
      p_user_id: user.id,
      p_new_total_capital: newTotalCapital
    })
  }

  // Process specific allocations
  const specificAllocations = allocations.filter(a => a.type === 'specific')
  
  for (const allocation of specificAllocations) {
    if (allocation.groupId) {
      // Add to group's available balance (reduce accumulated expenses)
      await supabase
        .from('finance_groups')
        .update({
          accumulated_expenses: supabase.raw('accumulated_expenses - ?', [allocation.amount])
        })
        .eq('id', allocation.groupId)
        .eq('user_id', user.id)
    }
  }

  // Create transaction record
  await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      group_id: allocations[0]?.groupId || null,
      date: new Date().toISOString().split('T')[0],
      concept: 'Income allocation',
      amount: totalAmount,
      type: 'income',
      allocation_type: allocations.length > 1 ? 'mixed' : allocations[0]?.type
    })

  revalidatePath('/dashboard')
  revalidatePath('/income')
}
```

### 3.3 API Routes (for external integrations)

```typescript
// app/api/groups/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: groups, error } = await supabase
    .from('finance_groups')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ groups })
}

// app/api/dashboard/route.ts
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile with total capital
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('total_capital')
    .eq('id', user.id)
    .single()

  // Get all finance groups
  const { data: groups } = await supabase
    .from('finance_groups')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select(`
      *,
      finance_groups(name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    totalCapital: profile?.total_capital || 0,
    groups: groups || [],
    recentTransactions: recentTransactions || []
  })
}
```

## 4. API Specifications

### 4.1 Transaction Creation

**POST /api/transactions**

Request Body:
```json
{
  "date": "2025-01-15",
  "concept": "Grocery shopping",
  "amount": -150.50,
  "groupId": 2,
  "type": "expense"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "date": "2025-01-15",
    "concept": "Grocery shopping",
    "amount": -150.50,
    "groupId": 2,
    "type": "expense",
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "updatedBalances": {
    "groupId": 2,
    "newAvailableBalance": 1437.50,
    "newAccumulatedExpenses": 650.50
  }
}
```

### 4.2 Income Allocation

**POST /api/income/allocate**

Request Body:
```json
{
  "totalAmount": 3000,
  "allocations": [
    {
      "type": "general",
      "amount": 2000
    },
    {
      "type": "specific",
      "groupId": 3,
      "amount": 1000
    }
  ],
  "concept": "Monthly salary"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "transactionId": 124,
    "newTotalCapital": 16920,
    "updatedGroups": [
      {
        "id": 1,
        "name": "cushion",
        "capacity": 7614,
        "availableBalance": 7614
      },
      {
        "id": 3,
        "name": "entertainment",
        "capacity": 1692,
        "availableBalance": 1692
      }
    ]
  }
}
```

### 4.3 Dashboard Data

**GET /api/users/dashboard**

Response:
```json
{
  "success": true,
  "data": {
    "totalCapital": 16920,
    "groups": [
      {
        "id": 1,
        "name": "cushion",
        "percentage": 45,
        "capacity": 7614,
        "accumulatedExpenses": 0,
        "availableBalance": 7614,
        "isProtected": true
      },
      {
        "id": 2,
        "name": "personal_expenses",
        "percentage": 15,
        "capacity": 2538,
        "accumulatedExpenses": 650.50,
        "availableBalance": 1887.50,
        "isProtected": false
      }
    ],
    "recentTransactions": [
      {
        "id": 123,
        "date": "2025-01-15",
        "concept": "Grocery shopping",
        "amount": -150.50,
        "groupName": "personal_expenses",
        "type": "expense"
      }
    ]
  }
}
```

## 5. Frontend Architecture (Next.js 14)

### 5.1 Component Structure

```
components/
├── ui/                          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── LoadingSpinner.tsx
├── forms/                       # Form components
│   ├── TransactionForm.tsx
│   ├── IncomeAllocationForm.tsx
│   └── AuthForm.tsx
├── dashboard/                   # Dashboard-specific components
│   ├── FinanceGroupCard.tsx
│   ├── TransactionList.tsx
│   ├── CapitalSummary.tsx
│   └── KaizenChart.tsx
├── layout/                      # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Navigation.tsx
└── providers/                   # Context providers
    ├── AuthProvider.tsx
    ├── FinanceProvider.tsx
    └── ThemeProvider.tsx
```

### 5.2 State Management

#### 5.2.1 Context API Structure

```typescript
// app/lib/contexts/FinanceContext.tsx
'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'

interface FinanceGroup {
  id: string
  name: string
  percentage: number
  capacity: number
  accumulated_expenses: number
  available_balance: number
  is_cushion: boolean
}

interface FinanceState {
  totalCapital: number
  groups: FinanceGroup[]
  recentTransactions: Transaction[]
  loading: boolean
  error: string | null
}

interface FinanceContextType {
  state: FinanceState
  dispatch: React.Dispatch<FinanceAction>
  refreshDashboard: () => Promise<void>
  createTransaction: (transaction: CreateTransactionData) => Promise<void>
  allocateIncome: (allocation: IncomeAllocation) => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
```

#### 5.2.2 Custom Hooks

```typescript
// app/lib/hooks/useFinanceData.ts
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useFinanceData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const supabase = createClientComponentClient()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      const result = await response.json()
      
      if (!response.ok) throw new Error(result.error)
      
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return { data, loading, error, refetch: fetchDashboardData }
}

// app/lib/hooks/useRealTimeUpdates.ts
import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useRealTimeUpdates(userId: string, onUpdate: () => void) {
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel('finance-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        onUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'finance_groups',
          filter: `user_id=eq.${userId}`
        },
        onUpdate
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onUpdate, supabase])
}
```

### 5.3 Key Components

#### 5.3.1 Dashboard Page

```typescript
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/dashboard/DashboardContent'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Financial Dashboard</h1>
      
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardContent userId={user.id} />
      </Suspense>
    </div>
  )
}
```

#### 5.3.2 Transaction Form with Server Actions

```typescript
// components/forms/TransactionForm.tsx
'use client'

import { useTransition } from 'react'
import { createTransaction } from '@/lib/actions/finance'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface TransactionFormProps {
  groups: FinanceGroup[]
  onSuccess?: () => void
}

export default function TransactionForm({ groups, onSuccess }: TransactionFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createTransaction(formData)
        onSuccess?.()
      } catch (error) {
        console.error('Transaction failed:', error)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-1">
          Transaction Type
        </label>
        <select
          name="type"
          id="type"
          required
          className="w-full p-2 border rounded-md"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label htmlFor="groupId" className="block text-sm font-medium mb-1">
          Finance Group
        </label>
        <select
          name="groupId"
          id="groupId"
          required
          className="w-full p-2 border rounded-md"
        >
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        name="concept"
        label="Concept"
        placeholder="Transaction description"
        required
      />

      <Input
        name="amount"
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        required
      />

      <Input
        name="date"
        label="Date"
        type="date"
        defaultValue={new Date().toISOString().split('T')[0]}
        required
      />

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? 'Processing...' : 'Create Transaction'}
      </Button>
    </form>
  )
}
```

## 6. Security Considerations

### 6.1 Authentication & Authorization
- JWT tokens with expiration
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration

### 6.2 Input Validation
- Server-side validation for all inputs
- Sanitization of user data
- SQL injection prevention via parameterized queries
- XSS protection

### 6.3 Data Protection
- HTTPS enforcement
- Environment variables for sensitive data
- Database connection encryption
- Regular security audits

## 7. Performance Optimization

### 7.1 Database Optimization
- Proper indexing on frequently queried columns
- Connection pooling
- Query optimization
- Pagination for large datasets

### 7.2 Frontend Optimization
- Code splitting and lazy loading
- Memoization of expensive calculations
- Optimized re-renders with React.memo
- Efficient state updates

### 7.3 Caching Strategy
- API response caching
- Browser caching for static assets
- Redis for session management (future enhancement)

## 8. Error Handling

### 8.1 Backend Error Handling
```javascript
// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

### 8.2 Frontend Error Handling
- Error boundaries for React components
- Global error state management
- User-friendly error messages
- Retry mechanisms for failed requests

## 9. Testing Strategy

### 9.1 Backend Testing
- Unit tests for business logic
- Integration tests for API endpoints
- Database transaction testing
- Security testing

### 9.2 Frontend Testing
- Component unit tests with Jest/React Testing Library
- Integration tests for user workflows
- E2E tests with Cypress
- Accessibility testing

## 10. Deployment Architecture

### 10.1 Development Environment
- Local PostgreSQL database
- Node.js development server
- React development server with hot reload

### 10.2 Production Environment
- Docker containerization
- PostgreSQL database with backups
- Nginx reverse proxy
- SSL/TLS certificates
- Environment-based configuration

This technical design provides a solid foundation for implementing Hugo's personal finance management system with scalability, security, and maintainability in mind.