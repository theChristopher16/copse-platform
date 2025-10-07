# 🌳 Copse Platform Setup Guide

## 🚀 Quick Start

### 1. Firebase Project Setup ✅
- ✅ Firebase project created: `copse-platform`
- ✅ Web app added and configured
- ✅ Configuration updated in `copse-web/firebase.config.js`

### 2. Enable Firebase Services

Go to your Firebase Console and enable these services:

#### **Authentication**
1. Go to **Authentication** → **Sign-in method**
2. Enable:
   - ✅ **Email/Password**
   - ✅ **Google** (for OAuth)
   - ✅ **Apple** (for iOS compatibility)

#### **Firestore Database**
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll deploy security rules)
3. Select **us-central1** region

#### **Cloud Functions**
1. Go to **Functions** → **Get started**
2. Enable billing (required for Functions)

#### **Hosting**
1. Go to **Hosting** → **Get started**
2. This will be used to deploy the web app

#### **Storage**
1. Go to **Storage** → **Get started**
2. Choose **Start in test mode**

### 3. Deploy Security Rules

```bash
cd copse-web
firebase deploy --only firestore:rules
```

### 4. Install Dependencies

```bash
cd copse-web
npm install
```

### 5. Start Development

```bash
npm run dev
```

## 🏗️ Project Structure

```
copse-platform/
├── copse-web/                 # Main web application
│   ├── src/
│   │   ├── types/copse.ts     # Core types
│   │   ├── contexts/CopseContext.tsx  # Tenant context
│   │   ├── services/copseService.ts   # Data services
│   │   └── components/        # UI components
│   ├── firebase.json          # Firebase config
│   ├── firestore.rules        # Security rules
│   └── firebase.config.js     # Firebase SDK config
├── copse-functions/           # Cloud Functions (future)
├── copse-admin/              # Super admin dashboard (future)
└── docs/                     # Documentation
```

## 🎯 Next Steps

1. **Deploy Firestore Rules**: `firebase deploy --only firestore:rules`
2. **Create First Tenant**: Use the admin interface to create a test tenant
3. **Test Multi-tenancy**: Verify tenant isolation works
4. **Add iOS/Android**: When ready, add mobile apps to the Firebase project

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

## 🛡️ Security

The platform uses enterprise-grade security:
- **Tenant-scoped data isolation**
- **Role-based access control (RBAC)**
- **Platform vs tenant-level permissions**
- **Audit logging for compliance**

## 📱 Multi-Platform Support

- ✅ **Web** (Current)
- 🔄 **iOS** (Add to Firebase project when ready)
- 🔄 **Android** (Add to Firebase project when ready)

## 🆘 Troubleshooting

### Common Issues:

1. **Firestore Rules Error**: Make sure you've deployed the rules
2. **Authentication Error**: Check that Auth is enabled in Firebase Console
3. **CORS Issues**: Verify Firebase configuration is correct

### Getting Help:

- Check Firebase Console for service status
- Review Firestore rules in `copse-web/firestore.rules`
- Check browser console for detailed error messages
