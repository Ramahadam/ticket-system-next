'use client';

import { FileSpreadsheetIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToExcel } from '@/lib/helpers';

interface ExcelExportButtonProps {
  data: Record<string, unknown>[];
  fileName: string;
}

export function ExcelExportButton({ data, fileName }: ExcelExportButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={() => exportToExcel(data, fileName)}>
      <FileSpreadsheetIcon className="size-4" />
      Export to Excel
    </Button>
  );
}
