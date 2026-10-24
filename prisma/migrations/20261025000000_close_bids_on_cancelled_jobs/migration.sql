-- Bids left PENDING on jobs cancelled before cancelling closed them.
UPDATE "Bid" SET "status" = 'REJECTED'
WHERE "status" = 'PENDING'
  AND "jobId" IN (SELECT "id" FROM "Job" WHERE "status" = 'CANCELLED');
