#!/bin/bash

# Uninstall vulnerable packages
npm uninstall xlsx jspdf jspdf-autotable

# Run npm audit
npm audit