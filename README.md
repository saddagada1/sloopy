# Sloopy

Work in progress...

Live: https://sloopy.saivamsi.ca

## Update (2023-11-15)

Waiting on Spotify to respond and accept my request to take the application into production. Until then if you would like to use Sloopy you can do so with
the following account:

- sloopy@acme.ca
- password

Or give me a message and I can add your Spotify account to the list of allowed profile.

- Added shadcn and completely redesigned the UI
- Made responsive (to a degree, still working on some edge cases)
- Switched to JWT from sessions
- Added optimistic updates
- Added multiple tunings
- Cleaned up components

## Itinerary

- Make responsive (currently only supports mobile)
- Optimize database reads and writes
- Rework NextAuth to take load off database
- Optimistically update mutations and use react-query cache more if possible
- Cleanup Components

## Oversights

- Forgetting to add tuning to sloops so they can be made for tracks outside of standard tuning (completely slipped my mind)
- Creating my own ui library (really good experience but not really efficient)
- Not factoring out more components (copy & paste is a really bad habit)
