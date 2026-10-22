-- ODD 018 S2: Comment.mentions now stores user IDs (W2) instead of usernames.
-- Old username entries could never be resolved back to users, and no reader
-- depended on them, so existing rows are reset to the empty set.
UPDATE "Comment" SET mentions = ARRAY[]::TEXT[];
