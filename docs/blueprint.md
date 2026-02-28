# **App Name**: HomIllu

## Core Features:

- User Authentication & Profile Management: Secure sign-up, login, and management of user profiles, including storing each user's preferred language using Firebase Authentication and Firestore.
- Dynamic Multi-Language UI (i18n): Provide a language-switch button to dynamically change the UI between English (en) and Telugu (te), utilizing i18next and JSON language packs for all displayed strings. The selected language will be persisted in the user's Firestore profile.
- Family Task & Chore Management: Users can create, assign, track completion, and categorize tasks and chores for family members. All UI elements for this feature will be localized.
- Shared Family Shopping List: A collaborative shopping list where family members can add items, specify quantities, mark items as purchased, and flag favorites. All UI elements for this feature will be localized.
- Family Event Calendar: Manage and view family events, appointments, and important dates with options for setting all-day events and inviting family members. All UI elements for this feature will be localized.
- Interactive Family Tree (Web Only): A web-based interactive chart for visualizing family members and relationships. Users can add, edit, and delete people (nodes) and relationships (edges), with changes syncing in real-time via Firestore. This page includes fully localized UI text.
- AI-powered Family Tree Description Tool: A generative AI tool that can assist users by suggesting descriptive texts for family member profiles or relationship summaries within the interactive family tree, based on input data.

## Style Guidelines:

- Primary color: A sophisticated, slightly desaturated petrol blue-green (#298899), evoking stability, trust, and connection. (HSL: 195, 60%, 40%)
- Background color: A very light, almost white tone with a subtle hint of the primary hue (#EFF5F6), creating a clean and spacious canvas. (HSL: 195, 15%, 95%)
- Accent color: A vibrant, energetic green (#26D679), providing clear call-to-action indicators and highlights, offering a refreshing contrast to the primary. (HSL: 165, 70%, 50%)
- Font family: 'Inter' (sans-serif) will be used for both headlines and body text, ensuring modern aesthetics, excellent legibility across all content types, and broad language support for English and Telugu.
- Use clean, modern, line-art style icons that are easily recognizable and culturally neutral for both English and Telugu speakers, consistent with the app's professional and approachable feel.
- Implement a responsive and intuitive layout designed for both mobile and web interfaces, featuring clear visual hierarchies, sufficient white space for readability, and consistent navigation patterns (e.g., app drawer/header for language switch).
- Incorporate subtle and purposeful animations for UI feedback, such as transitions between screens, loading indicators, and confirmation states, to enhance user experience without being distracting.