# Task: Fix User Login Redirect Issue and React Router Warning

## Steps:

- [ ] Update frontend/src/main.jsx: Add the `future={{ v7_relativeSplatPath: true }}` prop to the BrowserRouter component to opt-in to the v7 relative splat path behavior and suppress the warning.

- [ ] Update frontend/src/components/User/UserLogin.jsx: 
  - Remove the immediate `navigate("/user/dashboard")` call from the success path in `handleSubmit`.
  - Add a `useEffect` hook that watches for the `user` prop to be set (indicating successful authentication) and then navigates to `/user/dashboard`.
  - Ensure `useEffect` is imported from React.

- [ ] Test the changes: Run the frontend and verify login redirects correctly to dashboard without the warning.

## Follow-up:
- Verify no structural changes were made.
- Update TODO.md as steps are completed.
