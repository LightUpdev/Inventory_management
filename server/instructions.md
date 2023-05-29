 <!-- Forgot password process -->
[ ] user click on forgot password
[ ] create a reset token (string) and save in database
[ ] send reset token to user email in the form of link.
[ ] when the user clicks the link , compare the reset token in the link with that saved in the database
[ ] if they match, reset the users password


<!-- Forgot password steps -->
[ ] Create forgot password route
[ ] create token model
[ ] create email sender function
[ ] create controller function