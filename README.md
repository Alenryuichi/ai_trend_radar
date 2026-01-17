<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI TrendRadar

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

An AI-powered trend radar application that leverages Google's Gemini API to track and analyze emerging AI trends, technologies, and repositories.

View your app in AI Studio: https://ai.studio/apps/drive/14UKhVDnxviU6H6OoqDUWbbLx3V7GNvLA

## Features

- **Real-time AI Trend Analysis**: Track emerging trends in artificial intelligence using Google Gemini API
- **Radar Visualization**: Interactive radar charts showing trend distribution across categories
- **GitHub Integration**: Discover trending repositories related to AI topics
- **Multi-language Support**: Interface available in multiple languages
- **Web Analytics**: Track user interactions and performance metrics with Vercel Web Analytics
- **Performance Insights**: Monitor application performance with Vercel Speed Insights

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **API**: Google Gemini API for AI capabilities
- **Database**: Supabase for data persistence
- **Analytics**: Vercel Web Analytics & Speed Insights
- **Deployment**: Vercel
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Set the `GEMINI_API_KEY` to your Google Gemini API key
   - Add any other required environment variables (e.g., Supabase credentials)

3. Run the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

## Deployment

This project is configured to deploy on [Vercel](https://vercel.com). The `vercel.json` configuration includes:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Scheduled Crons**: Daily practice routine at 00:00 UTC

### Vercel Web Analytics & Speed Insights

This project includes [Vercel Web Analytics](https://vercel.com/analytics) and [Vercel Speed Insights](https://vercel.com/speed-insights) for monitoring:

- **Web Analytics**: Track page views, user interactions, and custom events
- **Speed Insights**: Monitor Core Web Vitals and application performance

These are automatically enabled when deployed to Vercel and can be viewed in your Vercel dashboard.

#### Local Development

When running locally (`npm run dev`), analytics data is collected but not sent to Vercel's dashboard until deployed.

#### Enabling Analytics in Vercel Dashboard

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select this project
3. Navigate to the **Analytics** tab
4. Click **Enable** to activate Web Analytics

Once enabled, analytics routes are available at `/_vercel/insights/*` after your next deployment.

For more information, visit the [Vercel Web Analytics documentation](https://vercel.com/docs/analytics).

## Project Structure

```
├── components/        # React components
├── services/         # API service functions and utilities
├── api/             # Vercel serverless functions
├── supabase/        # Supabase configuration
├── App.tsx          # Main application component
├── index.tsx        # Application entry point with Analytics setup
├── index.html       # HTML template
├── vite.config.ts   # Vite configuration
├── vercel.json      # Vercel deployment configuration
└── tsconfig.json    # TypeScript configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Environment Variables

Required environment variables (see `.env.example`):

- `GEMINI_API_KEY` - Google Gemini API key for AI trend analysis
- Additional variables for Supabase and other services (see `.env.example`)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
