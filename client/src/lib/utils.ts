import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind's utility-first approach
 * Uses clsx to merge class names and twMerge to handle Tailwind-specific merging
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency
 * @param value The number to format
 * @param locale The locale to use for formatting (default: 'en-US')
 * @param currency The currency to use (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  locale: string = "en-US",
  currency: string = "USD"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a date string
 * @param date The date to format
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateToFormat = typeof date === "string" ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat(
    "en-US",
    options || defaultOptions
  ).format(dateToFormat);
}

/**
 * Formats a number with commas and optional decimal places
 * @param value The number to format
 * @param decimalPlaces Number of decimal places to show
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  decimalPlaces: number = 0
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Formats a number as a percentage
 * @param value The decimal value to format (e.g., 0.15 for 15%)
 * @param decimalPlaces Number of decimal places to show
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimalPlaces: number = 1
): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Gets a color based on a value compared to a range
 * @param value The value to evaluate
 * @param min Minimum value in the range
 * @param max Maximum value in the range
 * @param invert Whether to invert the color scale
 * @returns A color string (red, yellow, or green)
 */
export function getColorFromValue(
  value: number,
  min: number,
  max: number,
  invert: boolean = false
): string {
  const third = (max - min) / 3;
  const firstThreshold = min + third;
  const secondThreshold = min + third * 2;

  // Determine which third of the range the value falls into
  let color: string;
  if (value < firstThreshold) {
    color = "red";
  } else if (value < secondThreshold) {
    color = "yellow";
  } else {
    color = "green";
  }

  // Invert the color if requested
  if (invert) {
    if (color === "red") return "green";
    if (color === "green") return "red";
  }

  return color;
}

/**
 * Debounces a function call
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generates a URL-friendly slug from a string
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Copies text to the clipboard
 * @param text The text to copy
 * @returns A promise that resolves when the text is copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

/**
 * Extracts the domain from a URL
 * @param url The URL to extract the domain from
 * @returns The domain
 */
export function getDomainFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (e) {
    // If the URL is invalid, return the original string
    return url;
  }
}

/**
 * Gets the file extension from a filename
 * @param filename The filename to get the extension from
 * @returns The file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Determines if a file is an image based on its extension
 * @param filename The filename to check
 * @returns True if the file is an image
 */
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
}

/**
 * Generates an array of page numbers for pagination
 * @param currentPage The current page number
 * @param totalPages The total number of pages
 * @param maxPages The maximum number of page links to show
 * @returns An array of page numbers
 */
export function getPageNumbers(
  currentPage: number, 
  totalPages: number, 
  maxPages: number = 5
): (number | string)[] {
  if (totalPages <= maxPages) {
    // If we have fewer pages than the max, show all pages
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const halfMax = Math.floor(maxPages / 2);
  let startPage = Math.max(currentPage - halfMax, 1);
  const endPage = Math.min(startPage + maxPages - 1, totalPages);

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(endPage - maxPages + 1, 1);
  }

  const pages: (number | string)[] = [];

  // Add first page and ellipsis if necessary
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }

  // Add page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add ellipsis and last page if necessary
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return pages;
}