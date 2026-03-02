#!/bin/bash

# Uninstalling specified packages
npm uninstall xlsx jspdf jspdf-autotable

# Running npm audit
npm audit

# Running type-check
npm run type-check

# Running lint
npm run lint

# Running build
npm run build
