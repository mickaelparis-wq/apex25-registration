-- Removes the test registration created while verifying the deploy, and
-- reverts the capacity count it incremented on session 'ai1'.
delete from registrations where id = 'APEX-9EDC1C';
update sessions set registrations = registrations - 1 where id = 'ai1';
