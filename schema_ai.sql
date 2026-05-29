-- Create a single persistent thread for the War Room
CREATE TABLE ai_threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store every message permanently so they never forget
CREATE TABLE ai_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id UUID REFERENCES ai_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  agent_name TEXT, -- e.g., 'Marketing', 'CEO', 'Finance'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store actionable outputs (Marketing drafts, Sales copy) for your approval
CREATE TABLE ai_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'tweet', 'email_campaign', 'pricing_strategy'
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the master thread (The initial War Room)
INSERT INTO ai_threads (title) VALUES ('Project 2M (Do or Die)');
