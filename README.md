# Secure File Download Generator

A React application that generates secure download links for files with configurable expiration times and download limits.

## Features

- File upload with size limits
- Configurable expiration time
- Configurable maximum download count
- Secure download links
- File storage in Supabase
- Download tracking

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd secure-file-download
```

2. Install dependencies:
```bash
npm install
```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Get your project URL and anon key from the project settings

4. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Set up Supabase:
   - Create a storage bucket named 'files'
   - Run the SQL migration in `supabase/migrations/20240101000000_create_file_links.sql`

6. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Project Structure

- `src/App.tsx`: Main application component
- `src/components/FileUploader.tsx`: File upload component
- `src/components/ConfigurationForm.tsx`: Configuration form component
- `src/components/DownloadHandler.tsx`: Download handler component
- `src/types.ts`: TypeScript type definitions
- `supabase/migrations/`: Database migration files

