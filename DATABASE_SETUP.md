# Database Setup for FIR Generator

This document provides the SQL commands needed to set up the FIR (First Information Report) database table in your Supabase project.

## Required Database Table

Run the following SQL command in your Supabase SQL editor to create the `fir_reports` table:

```sql
-- Create fir_reports table
CREATE TABLE fir_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fir_number TEXT UNIQUE NOT NULL,
  officer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  officer_name TEXT NOT NULL,
  officer_badge TEXT,
  officer_station TEXT,
  
  -- Complainant Information
  complainant_name TEXT NOT NULL,
  complainant_phone TEXT NOT NULL,
  complainant_email TEXT,
  complainant_address TEXT,
  
  -- Incident Information
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  incident_location TEXT NOT NULL,
  crime_type TEXT NOT NULL,
  incident_description TEXT NOT NULL,
  
  -- Additional Details
  witness_details TEXT,
  evidence_description TEXT,
  
  -- Status and Tracking
  status TEXT NOT NULL DEFAULT 'filed' CHECK (status IN ('filed', 'under_investigation', 'charges_filed', 'closed', 'rejected')),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_fir_reports_officer_id ON fir_reports(officer_id);
CREATE INDEX idx_fir_reports_fir_number ON fir_reports(fir_number);
CREATE INDEX idx_fir_reports_status ON fir_reports(status);
CREATE INDEX idx_fir_reports_crime_type ON fir_reports(crime_type);
CREATE INDEX idx_fir_reports_incident_date ON fir_reports(incident_date);
CREATE INDEX idx_fir_reports_created_at ON fir_reports(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_fir_reports_updated_at 
    BEFORE UPDATE ON fir_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE fir_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Police officers can only see their own FIRs
CREATE POLICY "Police can view own FIRs" ON fir_reports
    FOR SELECT USING (
        officer_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Police officers can create FIRs
CREATE POLICY "Police can create FIRs" ON fir_reports
    FOR INSERT WITH CHECK (
        officer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'police' AND is_verified = true
        )
    );

-- Police officers can update their own FIRs
CREATE POLICY "Police can update own FIRs" ON fir_reports
    FOR UPDATE USING (
        officer_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can view all FIRs
CREATE POLICY "Admins can view all FIRs" ON fir_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

## Features Included

The FIR Generator system includes:

### 1. **Complete FIR Management**
- Create new FIRs with comprehensive form validation
- View detailed FIR information
- Edit and update FIR status
- Search and filter FIRs by multiple criteria

### 2. **Form Fields**
- **Complainant Information**: Name, phone, email, address
- **Incident Details**: Date, time, location, crime type, description
- **Additional Information**: Witness details, evidence description
- **Status Tracking**: Filed, Under Investigation, Charges Filed, Closed, Rejected

### 3. **Role-Based Access**
- **Police Officers**: Can create, view, and edit their own FIRs
- **Admins**: Can view and manage all FIRs across the system

### 4. **Search and Filtering**
- Search by FIR number, complainant name, or incident description
- Filter by status, crime type, and date range
- Real-time search results

### 5. **Data Validation**
- Required field validation
- Email format validation
- Phone number validation
- Date/time validation

### 6. **User Interface**
- Modern, responsive design matching the existing website theme
- Intuitive navigation between list, create, view, and edit modes
- Status indicators with color coding
- Loading states and error handling

## Usage

1. **Creating a FIR**: Click "Create New FIR" button and fill in the required information
2. **Viewing FIRs**: Browse the list of FIRs with search and filter options
3. **Viewing Details**: Click the eye icon to view complete FIR details
4. **Editing FIRs**: Click the edit icon to update FIR status or details
5. **Searching**: Use the search bar and filters to find specific FIRs

## Database Schema

The `fir_reports` table includes all necessary fields for comprehensive FIR management with proper relationships to the existing `user_profiles` table for officer information.

## Security

- Row Level Security (RLS) is enabled
- Police officers can only access their own FIRs
- Admins have full access to all FIRs
- All operations are properly authenticated and authorized
