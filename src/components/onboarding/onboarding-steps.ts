import type { LucideIcon } from 'lucide-react';
import {
  Monitor,
  FolderKanban,
  Home,
  FileText,
  Plane,
  CheckCircle,
  CloudRain,
  FileBarChart,
  Rocket,
} from 'lucide-react';

export const ONBOARDING_VERSION = 1;

export interface OnboardingStepDef {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  highlights: string[];
  interactive?: 'view-mode-selector';
}

export const onboardingSteps: OnboardingStepDef[] = [
  {
    id: 'welcome',
    title: 'Welcome to SiteCheck',
    description:
      'AI-powered construction compliance for drone-assisted inspections. Choose how you want to experience the platform.',
    icon: Monitor,
    accentColor: 'text-amber-500',
    interactive: 'view-mode-selector',
    highlights: [
      'Website mode: Full desktop layout with sidebar navigation',
      'App mode: Mobile-optimized panel with bottom navigation',
    ],
  },
  {
    id: 'project-switcher',
    title: 'Project Switcher',
    description:
      'Manage multiple construction sites from one dashboard. Click the project name in the top bar to switch between bounded-site and linear pipeline projects.',
    icon: FolderKanban,
    accentColor: 'text-amber-400',
    highlights: [
      'Bounded-site projects for traditional construction areas',
      'Linear pipeline projects for corridor-based infrastructure',
      'All data updates automatically when you switch projects',
    ],
  },
  {
    id: 'dashboard',
    title: 'Command Dashboard',
    description:
      'Your real-time command center. View compliance metrics, site maps, and activity feeds at a glance.',
    icon: Home,
    accentColor: 'text-amber-500',
    highlights: [
      'BMP checkpoint counts and compliance rate',
      'Interactive site map with checkpoint markers',
      'Live activity feed with recent inspections and events',
    ],
  },
  {
    id: 'swppp',
    title: 'SWPPP Intelligence',
    description:
      'Upload your Stormwater Pollution Prevention Plan and let AI extract every BMP checkpoint automatically.',
    icon: FileText,
    accentColor: 'text-violet-500',
    highlights: [
      'PDF upload with page-level document viewer',
      'AI-powered checkpoint extraction with confidence scores',
      'Direct mission generation from extracted checkpoints',
    ],
  },
  {
    id: 'missions',
    title: 'Drone Mission Center',
    description:
      'Plan, execute, and review drone inspection flights with a guided 3-step wizard.',
    icon: Plane,
    accentColor: 'text-blue-400',
    highlights: [
      'Choose inspection scope and target BMPs',
      'AI-generated flight paths with waypoint editing',
      'Live telemetry, flight replay, and AI review',
    ],
  },
  {
    id: 'checkpoints',
    title: 'Checkpoint Inspector',
    description:
      'Filter, browse, and monitor all BMP checkpoints across your project with AI-assisted deficiency analysis.',
    icon: CheckCircle,
    accentColor: 'text-green-500',
    highlights: [
      'Filter by status, BMP type, zone, or corridor segment',
      'Detailed checkpoint cards with photo evidence',
      'Station-based labeling for linear pipeline projects',
    ],
  },
  {
    id: 'weather',
    title: 'Weather & Compliance',
    description:
      'Track weather conditions, precipitation events, and schedule inspections around compliance windows.',
    icon: CloudRain,
    accentColor: 'text-cyan-400',
    highlights: [
      'Current conditions and 7-day forecast',
      'QPE (Quantitative Precipitation Estimate) tracking',
      'Inspection timeline with compliance deadlines',
    ],
  },
  {
    id: 'reports',
    title: 'Inspection Reports',
    description:
      'Generate CGP-compliant inspection reports ready for regulatory submission.',
    icon: FileBarChart,
    accentColor: 'text-orange-500',
    highlights: [
      'Auto-generated from drone mission data',
      'Editable sections and digital signature blocks',
      'PDF export for regulatory submission',
    ],
  },
  {
    id: 'ready',
    title: "You're All Set",
    description:
      'Your SiteCheck workspace is ready. Dive into the dashboard to start managing your construction site compliance.',
    icon: Rocket,
    accentColor: 'text-amber-500',
    highlights: [],
  },
];
