# Personal Finance Management System - Requirements

## 1. Project Overview

**Project Name:** Hugo's Personal Finance Manager  
**Version:** 1.0  
**Date:** January 2025  
**Stakeholder:** Hugo Yupanqui  

### 1.1 Purpose
A personal finance management system that helps Hugo track his capital, manage transactions across predefined financial groups, and monitor financial progress using Kaizen methodology.

### 1.2 Scope
The system will manage four fixed financial groups with automatic calculations, transaction tracking, and historical progress analysis.

## 2. Functional Requirements

### 2.1 Financial Group Management

**FR-001: Fixed Financial Groups**
- **GIVEN** the system is initialized
- **WHEN** capital is allocated
- **THEN** the system SHALL distribute capital across four fixed groups:
  - Cushion (Colchón): 45% of total capital
  - Personal Expenses (Gastos personales): 15% of total capital  
  - Entertainment (Ocio): 10% of total capital
  - Investment/Savings (Inversión/ahorro): 30% of total capital

**FR-002: Group Capacity Calculation**
- **GIVEN** a total capital amount
- **WHEN** the system calculates group capacities
- **THEN** each group capacity SHALL equal the percentage of total capital
- **AND** the system SHALL maintain accumulated expenses per group
- **AND** available balance SHALL equal capacity minus accumulated expenses

**FR-003: Cushion Protection Rule**
- **GIVEN** any expense transaction
- **WHEN** the user attempts to use cushion funds for expenses
- **THEN** the system SHALL prevent the transaction
- **AND** display an error message "Cushion funds cannot be used for expenses"

### 2.2 Income Management

**FR-004: Income Allocation Options**
- **GIVEN** a new income is received
- **WHEN** the user processes the income
- **THEN** the system SHALL provide three allocation options:
  a) Partial or total allocation to specific groups up to their capacity
  b) Partial or total allocation to general recalculation (increasing total capital)
  c) Combination of both options

**FR-005: General Recalculation**
- **GIVEN** income allocated to general recalculation
- **WHEN** the recalculation is processed
- **THEN** the system SHALL increase total capital by the allocated amount
- **AND** recalculate all group capacities based on fixed percentages
- **AND** maintain existing accumulated expenses

**FR-006: Specific Group Allocation**
- **GIVEN** income allocated to a specific group
- **WHEN** the allocation is processed
- **THEN** the system SHALL add the amount to that group's available balance
- **AND** NOT exceed the group's current capacity
- **AND** display warning if allocation exceeds capacity

### 2.3 Transaction Management

**FR-007: Transaction Recording**
- **GIVEN** any financial transaction
- **WHEN** the transaction is recorded
- **THEN** the system SHALL capture:
  - Date (YYYY-MM-DD format)
  - Concept/Description
  - Amount (positive for income, negative for expenses)
  - Associated group
  - Type (income/expense)

**FR-008: Expense Processing**
- **GIVEN** an expense transaction
- **WHEN** the expense is processed
- **THEN** the system SHALL deduct the amount from the associated group's available balance
- **AND** increase the group's accumulated expenses
- **AND** prevent negative available balances
- **AND** NOT allow expenses from the cushion group

**FR-009: Transaction History**
- **GIVEN** recorded transactions
- **WHEN** the user views transaction history
- **THEN** the system SHALL display all transactions chronologically
- **AND** show transaction details (date, concept, amount, group, type)
- **AND** allow filtering by date range, group, or type

### 2.4 Dashboard and Reporting

**FR-010: Current Balance Dashboard**
- **GIVEN** the user accesses the dashboard
- **WHEN** the dashboard loads
- **THEN** the system SHALL display for each group:
  - Current capacity
  - Accumulated expenses
  - Available balance
- **AND** display current total capital

**FR-011: Kaizen Progress Tracking**
- **GIVEN** historical transaction data exists
- **WHEN** the user views progress tracking
- **THEN** the system SHALL show evolution compared to:
  - Last week (if data available)
  - Last month (if data available)  
  - Last year (if data available)
- **AND** highlight improvements in available balances and total capital
- **AND** show percentage changes

## 3. Non-Functional Requirements

### 3.1 Performance Requirements

**NFR-001: Response Time**
- **GIVEN** any user interaction
- **WHEN** the user performs an action
- **THEN** the system SHALL respond within 2 seconds for 95% of operations

**NFR-002: Data Consistency**
- **GIVEN** concurrent operations
- **WHEN** multiple calculations occur
- **THEN** the system SHALL maintain data consistency across all financial groups

### 3.2 Security Requirements

**NFR-003: Data Protection**
- **GIVEN** sensitive financial data
- **WHEN** data is stored or transmitted
- **THEN** the system SHALL encrypt all financial information
- **AND** implement secure authentication mechanisms

**NFR-004: Input Validation**
- **GIVEN** user input
- **WHEN** data is entered
- **THEN** the system SHALL validate all numerical inputs
- **AND** prevent SQL injection and XSS attacks

### 3.3 Usability Requirements

**NFR-005: User Interface**
- **GIVEN** the application interface
- **WHEN** the user interacts with the system
- **THEN** the interface SHALL be responsive on desktop and mobile devices
- **AND** follow modern UX best practices
- **AND** provide clear visual feedback for all actions

**NFR-006: Accessibility**
- **GIVEN** users with different abilities
- **WHEN** they access the application
- **THEN** the system SHALL comply with WCAG 2.1 AA standards
- **AND** support keyboard navigation
- **AND** provide appropriate color contrast

### 3.4 Reliability Requirements

**NFR-007: Data Backup**
- **GIVEN** financial data storage
- **WHEN** data is modified
- **THEN** the system SHALL automatically backup data
- **AND** maintain transaction history integrity

**NFR-008: Error Handling**
- **GIVEN** system errors or exceptions
- **WHEN** errors occur
- **THEN** the system SHALL provide meaningful error messages
- **AND** log errors for debugging
- **AND** gracefully recover from failures

## 4. Technical Constraints

### 4.1 Technology Stack
- Backend: Node.js with Express framework
- Frontend: React with modern JavaScript (ES6+)
- Database: PostgreSQL or SQLite for development
- All code and property names SHALL be in English

### 4.2 Data Requirements
- **GIVEN** financial calculations
- **WHEN** performing monetary operations
- **THEN** the system SHALL use decimal precision for currency
- **AND** handle amounts up to 999,999,999.99

## 5. Acceptance Criteria Summary

The system is considered complete when:
1. All four financial groups operate with fixed percentages
2. Cushion funds are completely protected from expenses
3. Income can be allocated using all three methods
4. All transactions are properly recorded and tracked
5. Dashboard shows real-time financial status
6. Kaizen tracking displays historical progress
7. System prevents invalid operations and provides clear feedback
8. All security and performance requirements are met

## 6. Future Enhancements (Out of Scope for v1.0)
- Multi-currency support
- Investment portfolio tracking
- Automated bill payments
- Financial goal setting and tracking
- Export functionality for tax purposes