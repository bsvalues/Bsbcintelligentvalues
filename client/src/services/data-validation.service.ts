/**
 * Data Validation Service
 * 
 * Advanced validation system for property data with intelligent error detection
 * and data normalization capabilities.
 */

import { Property } from '../types/property';

export enum ValidationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: ValidationSeverity;
  validate: (property: Property) => boolean;
  message: (property: Property) => string;
  fix?: (property: Property) => Property;
}

export interface ValidationIssue {
  ruleId: string;
  property: Property;
  severity: ValidationSeverity;
  message: string;
  canAutoFix: boolean;
}

export interface ValidationResult {
  property: Property;
  issues: ValidationIssue[];
  isValid: boolean;
  score: number; // 0-100 data quality score
  hasCriticalIssues: boolean;
}

export class PropertyDataValidator {
  private rules: ValidationRule[] = [];
  
  constructor() {
    this.initializeDefaultRules();
  }
  
  /**
   * Initialize the default validation rules
   */
  private initializeDefaultRules(): void {
    // General completeness rules
    this.addRule({
      id: 'required-fields',
      name: 'Required Fields Check',
      description: 'Validates that all required fields have values',
      severity: ValidationSeverity.ERROR,
      validate: (property: Property) => {
        const requiredFields = ['address', 'city', 'state', 'zipCode', 'propertyType'];
        return requiredFields.every(field => 
          property[field as keyof Property] !== undefined && 
          property[field as keyof Property] !== null && 
          property[field as keyof Property] !== ''
        );
      },
      message: () => 'Property is missing one or more required fields',
    });
    
    // Address format validation
    this.addRule({
      id: 'address-format',
      name: 'Address Format Check',
      description: 'Validates that the address follows standard format',
      severity: ValidationSeverity.WARNING,
      validate: (property: Property) => {
        if (!property.address) return false;
        
        // Simple address validation pattern - can be made more sophisticated
        const addressPattern = /^\d+\s+[A-Za-z0-9\s\.,'-]+$/;
        return addressPattern.test(property.address);
      },
      message: (property: Property) => `Address format may be invalid: "${property.address}"`,
      fix: (property: Property) => {
        if (!property.address) return property;
        
        // Simple address normalization - capitalize first letter of each word
        const normalizedAddress = property.address
          .replace(/\s+/g, ' ') // Remove extra spaces
          .replace(/(\b\w)/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
          
        return { ...property, address: normalizedAddress };
      }
    });
    
    // Numeric value range validation
    this.addRule({
      id: 'value-range',
      name: 'Property Value Range Check',
      description: 'Validates that property values are within reasonable ranges',
      severity: ValidationSeverity.WARNING,
      validate: (property: Property) => {
        if (property.price === undefined) return true;
        return property.price > 0 && property.price < 100000000; // Example range
      },
      message: (property: Property) => `Property value $${property.price} is outside the expected range`,
    });
    
    // Square footage validation
    this.addRule({
      id: 'sqft-range',
      name: 'Square Footage Range Check',
      description: 'Validates that square footage is within reasonable ranges',
      severity: ValidationSeverity.WARNING,
      validate: (property: Property) => {
        if (property.squareFeet === undefined) return true;
        return property.squareFeet > 0 && property.squareFeet < 50000; // Example range
      },
      message: (property: Property) => `Square footage ${property.squareFeet} is outside the expected range`,
    });
    
    // Year built validation
    this.addRule({
      id: 'year-built-range',
      name: 'Year Built Range Check',
      description: 'Validates that year built is within reasonable range',
      severity: ValidationSeverity.WARNING,
      validate: (property: Property) => {
        if (property.yearBuilt === undefined) return true;
        const currentYear = new Date().getFullYear();
        return property.yearBuilt > 1700 && property.yearBuilt <= currentYear;
      },
      message: (property: Property) => `Year built ${property.yearBuilt} is outside the expected range`,
      fix: (property: Property) => {
        if (!property.yearBuilt) return property;
        
        const currentYear = new Date().getFullYear();
        let fixedYear = property.yearBuilt;
        
        if (property.yearBuilt > currentYear) {
          fixedYear = currentYear;
        } else if (property.yearBuilt < 1700) {
          fixedYear = 1700; // Default to oldest reasonable year
        }
        
        return { ...property, yearBuilt: fixedYear };
      }
    });
    
    // Zip code format validation
    this.addRule({
      id: 'zipcode-format',
      name: 'Zip Code Format Check',
      description: 'Validates that zip code follows standard format',
      severity: ValidationSeverity.WARNING,
      validate: (property: Property) => {
        if (!property.zipCode) return true;
        
        // US zip code pattern (5 digits or 5+4)
        const zipPattern = /^\d{5}(-\d{4})?$/;
        return zipPattern.test(property.zipCode);
      },
      message: (property: Property) => `Zip code format may be invalid: "${property.zipCode}"`,
      fix: (property: Property) => {
        if (!property.zipCode) return property;
        
        // Extract just the digits from zip code
        const digits = property.zipCode.replace(/\D/g, '');
        
        // Format based on length
        let formattedZip = property.zipCode;
        if (digits.length === 5) {
          formattedZip = digits;
        } else if (digits.length === 9) {
          formattedZip = `${digits.substring(0, 5)}-${digits.substring(5)}`;
        }
        
        return { ...property, zipCode: formattedZip };
      }
    });
    
    // Data consistency rules
    this.addRule({
      id: 'price-sqft-consistency',
      name: 'Price to Square Foot Consistency',
      description: 'Checks if price per square foot is within reasonable range for the area',
      severity: ValidationSeverity.WARNING,
      validate: (property: Property) => {
        if (!property.price || !property.squareFeet || property.squareFeet === 0) return true;
        
        const pricePerSqFt = property.price / property.squareFeet;
        
        // Example reasonable range - would be calibrated by region in production
        return pricePerSqFt > 50 && pricePerSqFt < 10000;
      },
      message: (property: Property) => {
        if (!property.price || !property.squareFeet || property.squareFeet === 0) return '';
        
        const pricePerSqFt = property.price / property.squareFeet;
        return `Price per square foot ($${pricePerSqFt.toFixed(2)}) is unusual for this type of property`;
      },
    });
  }
  
  /**
   * Add a custom validation rule
   */
  public addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }
  
  /**
   * Remove a validation rule by ID
   */
  public removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }
  
  /**
   * Validate a single property against all rules
   */
  public validate(property: Property): ValidationResult {
    const issues: ValidationIssue[] = [];
    
    for (const rule of this.rules) {
      const isValid = rule.validate(property);
      
      if (!isValid) {
        issues.push({
          ruleId: rule.id,
          property: property,
          severity: rule.severity,
          message: rule.message(property),
          canAutoFix: !!rule.fix
        });
      }
    }
    
    const hasCriticalIssues = issues.some(issue => 
      issue.severity === ValidationSeverity.CRITICAL || 
      issue.severity === ValidationSeverity.ERROR
    );
    
    // Calculate quality score based on number and severity of issues
    let score = 100;
    issues.forEach(issue => {
      switch (issue.severity) {
        case ValidationSeverity.INFO:
          score -= 1;
          break;
        case ValidationSeverity.WARNING:
          score -= 5;
          break;
        case ValidationSeverity.ERROR:
          score -= 20;
          break;
        case ValidationSeverity.CRITICAL:
          score -= 50;
          break;
      }
    });
    
    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    return {
      property,
      issues,
      isValid: issues.length === 0,
      score,
      hasCriticalIssues
    };
  }
  
  /**
   * Validate multiple properties
   */
  public validateBatch(properties: Property[]): ValidationResult[] {
    return properties.map(property => this.validate(property));
  }
  
  /**
   * Auto-fix a property based on validation rules
   */
  public autoFix(property: Property): { property: Property, fixedIssues: string[] } {
    let fixedProperty = { ...property };
    const fixedIssues: string[] = [];
    
    for (const rule of this.rules) {
      if (rule.fix && !rule.validate(fixedProperty)) {
        fixedProperty = rule.fix(fixedProperty);
        
        // Verify the fix worked
        if (rule.validate(fixedProperty)) {
          fixedIssues.push(rule.id);
        }
      }
    }
    
    return {
      property: fixedProperty,
      fixedIssues
    };
  }
  
  /**
   * Get detailed information about a specific rule
   */
  public getRuleInfo(ruleId: string): ValidationRule | undefined {
    return this.rules.find(rule => rule.id === ruleId);
  }
  
  /**
   * Get all validation rules
   */
  public getAllRules(): ValidationRule[] {
    return [...this.rules];
  }
}

// Export singleton instance
export const propertyValidator = new PropertyDataValidator();

// Batch processing service for efficient operations on multiple properties
export class BatchProcessingService {
  /**
   * Process a batch of properties with a transformation function
   */
  public processBatch<T>(
    properties: Property[], 
    processFn: (property: Property) => T, 
    options: { 
      parallel?: boolean, 
      chunkSize?: number,
      onProgress?: (processed: number, total: number) => void 
    } = {}
  ): T[] {
    const { parallel = false, chunkSize = 100, onProgress } = options;
    const results: T[] = [];
    
    if (parallel) {
      // Simple parallel processing (would be more sophisticated in production)
      results.push(...properties.map(processFn));
      
      if (onProgress) {
        onProgress(properties.length, properties.length);
      }
    } else {
      // Process in chunks to avoid blocking the UI
      for (let i = 0; i < properties.length; i += chunkSize) {
        const chunk = properties.slice(i, i + chunkSize);
        results.push(...chunk.map(processFn));
        
        if (onProgress) {
          onProgress(Math.min(i + chunkSize, properties.length), properties.length);
        }
      }
    }
    
    return results;
  }
  
  /**
   * Group properties by a key selector function
   */
  public groupProperties<K extends string | number>(
    properties: Property[],
    keySelector: (property: Property) => K
  ): Record<K, Property[]> {
    return properties.reduce((grouped, property) => {
      const key = keySelector(property);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(property);
      return grouped;
    }, {} as Record<K, Property[]>);
  }
  
  /**
   * Apply a batch update to multiple properties
   */
  public applyBatchUpdate(
    properties: Property[],
    updateFn: (property: Property) => Partial<Property>
  ): Property[] {
    return properties.map(property => ({
      ...property,
      ...updateFn(property)
    }));
  }
  
  /**
   * Filter properties based on multiple criteria
   */
  public filterBatch(
    properties: Property[],
    filters: Array<(property: Property) => boolean>
  ): Property[] {
    return properties.filter(property => 
      filters.every(filter => filter(property))
    );
  }
  
  /**
   * Validate a batch of properties and group by validity
   */
  public validateAndGroup(properties: Property[]): {
    valid: Property[];
    invalid: Property[];
    results: ValidationResult[];
  } {
    const results = propertyValidator.validateBatch(properties);
    
    const valid = results
      .filter(result => result.isValid)
      .map(result => result.property);
      
    const invalid = results
      .filter(result => !result.isValid)
      .map(result => result.property);
      
    return { valid, invalid, results };
  }
  
  /**
   * Auto-fix all fixable issues in a batch of properties
   */
  public autoFixBatch(properties: Property[]): {
    fixed: Property[];
    unfixable: Property[];
    fixedIssueCount: number;
  } {
    let fixedIssueCount = 0;
    const results = properties.map(property => {
      const { property: fixedProperty, fixedIssues } = propertyValidator.autoFix(property);
      fixedIssueCount += fixedIssues.length;
      return {
        original: property,
        fixed: fixedProperty,
        issuesFixed: fixedIssues.length,
        isChanged: JSON.stringify(property) !== JSON.stringify(fixedProperty)
      };
    });
    
    const fixed = results
      .filter(result => result.isChanged)
      .map(result => result.fixed);
      
    const unfixable = results
      .filter(result => !result.isChanged)
      .map(result => result.original);
      
    return { fixed, unfixable, fixedIssueCount };
  }
}

// Export batch processing service instance
export const batchProcessor = new BatchProcessingService();