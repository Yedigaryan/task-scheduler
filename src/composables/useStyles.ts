export const useStyles = () => {
    return {
        colors: {
            primary: '#6366f1',      // indigo-500
            primaryDark: '#4f46e5',  // indigo-600
            primaryLight: '#eef2ff', // indigo-50
            secondary: '#a855f7',    // purple-600
            success: '#22c55e',      // green-500
            warning: '#f59e0b',      // orange-500
            danger: '#ef4444',       // red-500
            gray50: '#f9fafb',
            gray100: '#f3f4f6',
            gray200: '#e5e7eb',
            gray400: '#9ca3af',
            gray500: '#6b7280',
            gray600: '#4b5563',
            gray700: '#374151',
            gray800: '#1f2937',
            white: '#ffffff',
        },
        gradients: {
            primaryPurple: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        },
        shadows: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        spacing: {
            xs: '0.25rem',   // 4px
            sm: '0.5rem',    // 8px
            md: '0.75rem',   // 12px
            lg: '1rem',      // 16px
            xl: '1.5rem',    // 24px
            xxl: '2rem',     // 32px
            xxxl: '3rem',    // 48px
        },
        borderRadius: {
            sm: '0.375rem',  // 6px
            md: '0.5rem',    // 8px
            lg: '0.75rem',   // 12px
            xl: '1rem',      // 16px
            xxl: '1.5rem',   // 24px
        },
    };
};
