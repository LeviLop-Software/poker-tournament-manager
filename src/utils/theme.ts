import { extendTheme } from '@chakra-ui/react';

// Define all color values
const colors = {
  blue: {
    50: '#e6f7ff',
    100: '#b3e0ff',
    200: '#80caff',
    300: '#4db3ff',
    400: '#1a9dff',
    500: '#0086e6',
    600: '#0069b3',
    700: '#004d80',
    800: '#00304d',
    900: '#00141f',
  },
  purple: {
    50: '#f5e9ff',
    100: '#e9d2ff',
    200: '#d8b4fe',
    300: '#c084fc',
    400: '#9f7aea',
    500: '#805ad5',
    600: '#6b46c1',
    700: '#553c9a',
    800: '#44337a',
    900: '#322659',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  poker: {
    green: '#1B5E20',
    darkGreen: '#003300',
    red: '#B71C1C',
    blue: '#0D47A1',
    chip: '#FFD700',
  },
  casino: {
    blue: '#00215a',
    blueLight: '#0066cc',
    blueBright: '#00ccff',
  },
  brand: {
    500: '#0086e6',
    600: '#0069b3',
  },
};

// Create the theme configuration
const theme = extendTheme({
  fonts: {
    heading: 'system-ui, sans-serif',
    body: 'system-ui, sans-serif',
  },
  colors,
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        primary: {
          bg: 'blue.500',
          color: 'white',
          _hover: {
            bg: 'blue.600',
          },
        },
        secondary: {
          bg: 'gray.200',
          color: 'gray.800',
          _hover: {
            bg: 'gray.300',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'lg',
          p: 4,
        },
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;
