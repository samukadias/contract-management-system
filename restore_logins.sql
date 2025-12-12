-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert users into auth.users based on public.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
SELECT
    '00000000-0000-0000-0000-000000000000', -- instance_id (default for local)
    id,
    'authenticated',
    'authenticated',
    email,
    crypt('123456', gen_salt('bf')), -- Default password: '123456'
    now(), -- email_confirmed_at
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('full_name', full_name, 'perfil', perfil),
    now(),
    now(),
    '',
    '',
    '',
    ''
FROM public.users
ON CONFLICT (id) DO NOTHING;

-- Grant permissions just in case
GRANT ALL ON TABLE public.users TO postgres;
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
