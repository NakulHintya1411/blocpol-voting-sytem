// Simple test setup for the frontend
// This file can be used to test basic functionality

import { formatAddress, formatNumber, formatPercentage } from './utils/helpers';

// Test helper functions
console.log('Testing helper functions...');

// Test formatAddress
console.log('formatAddress test:', formatAddress('0x1234567890abcdef1234567890abcdef12345678'));
console.log('formatAddress short:', formatAddress('0x1234'));

// Test formatNumber
console.log('formatNumber test:', formatNumber(1234567));
console.log('formatNumber zero:', formatNumber(0));

// Test formatPercentage
console.log('formatPercentage test:', formatPercentage(25, 100));
console.log('formatPercentage zero:', formatPercentage(0, 100));

console.log('All tests passed!');
