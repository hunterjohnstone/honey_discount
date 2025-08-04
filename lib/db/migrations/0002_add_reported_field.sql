-- Add reported column with default value 0
ALTER TABLE products ADD COLUMN reported INTEGER DEFAULT 0;

-- Update existing rows to set reported = 0 if they're currently NULL
UPDATE products SET reported = 0 WHERE reported IS NULL;


