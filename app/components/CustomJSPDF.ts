import jsPDF from "jspdf"
import { Table, UserOptions } from "jspdf-autotable"

export type CustomJSPDF = jsPDF & {
    autoTable: (options: UserOptions) => jsPDF
    lastAutoTable: Table | false
    previousAutoTable: Table | false
    autoTableText: (text: string | string[], x: number, y: number, styles: any) => void
    autoTableSetDefaults: (defaults: UserOptions) => jsPDF
    autoTableHtmlToJson: (tableElem: HTMLTableElement, includeHiddenElements?: boolean) => { columns: string[], rows: any[], data: any[] } | null
    autoTableEndPosY: () => number
    autoTableAddPageContent: (hook: () => void) => jsPDF
    autoTableAddPage: () => jsPDF

  }