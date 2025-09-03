# Sitecore XM Cloud - Google Analytics Marketplace Module

A **Sitecore XM Cloud Marketplace module** that enables seamless Google Analytics integration within the XM Cloud environment. This module provides real-time analytics data visualization, including page views and active user metrics, directly within your Sitecore experience.

## 🚀 Features

- **Real-time Analytics Dashboard**: View Google Analytics data directly in XM Cloud
- **Interactive Data Visualization**: Dynamic charts for page views and active users
- **Responsive Design**: Modern UI built with Chakra UI and Sitecore Blok theme
- **Flexible Date Ranges**: Analyze data from 1 to 90 days
- **Site-specific Analytics**: Automatic filtering based on current XM Cloud site context
- **Easy Configuration**: Streamlined setup process within XM Cloud environment
- **Marketplace Integration**: Full integration with Sitecore Marketplace SDK

## 📋 Prerequisites

### Sitecore Environment
- **Sitecore XM Cloud** environment.

### Google Analytics Setup
- **Google Analytics 4 (GA4)** property
- **Google Cloud Project** with Analytics Reporting API enabled
- **Service Account** with appropriate permissions

## 🔧 Installation & Setup

### 1. Deploy to XM Cloud
This module is designed to be deployed as a Marketplace module within Sitecore XM Cloud.

### 2. Configure Google Service Account

#### Create Google Cloud Project & Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Analytics Reporting API**
4. Create a **Service Account** under APIs & Services > Credentials
5. Download the JSON key file for the service account

#### Add Service Account to Google Analytics
1. Go to [Google Analytics Admin panel](https://analytics.google.com/analytics/web/)
2. Navigate to your GA4 property
3. Go to Property Settings > Property Access Management
4. Add the service account email with **Read & Analyze** permissions

### 3. Environment Configuration

Set up the following environment variables in your XM Cloud environment:

```bash
GA_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
```

**Finding your GA4 Property ID:**
- Go to Google Analytics > Admin > Property Details
- Find the Property ID in the top right corner

## 🏗️ Development

### Local Development Setup

1. **Clone the repository:**
```bash
git clone [repository-url]
cd marketplace-google-analytics
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env.local` file with your Google Analytics credentials:
```bash
GA_CLIENT_EMAIL=your-service-account-email
GA_PRIVATE_KEY=your-private-key
```

4. **Run development server:**
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000), but needs to be loaded with in the Sitecore Marketplace extension points to run correctly.

## 📄 License

This project is licensed under the Apache License 2.0 [LICENSE.md](LICENSE.md).

## 🐛 Issues

If you encounter any issues or have suggestions for improvements, please open an issue on the repository.