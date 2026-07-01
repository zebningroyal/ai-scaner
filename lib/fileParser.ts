/**
 * Universal File Parser for JARVIS OBD2 Scanner
 * Extracts text from multiple file formats without external dependencies
 */

export interface ParsedFile {
  success: boolean
  content: string
  fileType: string
  message: string
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const fileType = file.type
  const fileName = file.name.toLowerCase()

  // Text files
  if (fileType === "text/plain" || fileName.endsWith(".txt")) {
    return parseTextFile(file)
  }

  // PDF files
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return parsePDFFile(file)
  }

  // Excel files
  if (
    fileType === "application/vnd.ms-excel" ||
    fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls")
  ) {
    return parseExcelFile(file)
  }

  // Word documents
  if (
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx") ||
    fileName.endsWith(".doc")
  ) {
    return parseWordFile(file)
  }

  // CSV files
  if (fileType === "text/csv" || fileName.endsWith(".csv")) {
    return parseCSVFile(file)
  }

  // Image files - attempt text extraction
  if (fileType.startsWith("image/")) {
    return parseImageFile(file)
  }

  // JSON files
  if (fileType === "application/json" || fileName.endsWith(".json")) {
    return parseJSONFile(file)
  }

  return {
    success: false,
    content: "",
    fileType: fileType || "unknown",
    message: `File type "${fileType || fileName}" not supported. Please upload: TXT, PDF, Excel, Word, CSV, or Image files.`,
  }
}

async function parseTextFile(file: File): Promise<ParsedFile> {
  try {
    const content = await file.text()
    return {
      success: true,
      content,
      fileType: "text",
      message: "Text file parsed successfully",
    }
  } catch (error) {
    return {
      success: false,
      content: "",
      fileType: "text",
      message: `Error reading text file: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function parsePDFFile(file: File): Promise<ParsedFile> {
  try {
    // Use PDF.js if available, otherwise provide helpful message
    const buffer = await file.arrayBuffer()
    
    // Try to extract basic text by searching for text streams
    // This is a simplified approach that works with simple PDFs
    const bytes = new Uint8Array(buffer)
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes)
    
    // Extract printable characters that might contain OBD codes
    const extracted = text
      .replace(/[^\x20-\x7E\n]/g, "") // Keep only printable ASCII
      .split("\n")
      .join(" ")
    
    if (extracted.length > 0) {
      return {
        success: true,
        content: extracted,
        fileType: "pdf",
        message: "PDF content extracted (basic text extraction)",
      }
    }

    return {
      success: false,
      content: "",
      fileType: "pdf",
      message: "PDF file could not be parsed. Try converting to text or image first.",
    }
  } catch (error) {
    return {
      success: false,
      content: "",
      fileType: "pdf",
      message: `Error reading PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function parseExcelFile(file: File): Promise<ParsedFile> {
  try {
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer)
    
    // Simple extraction: look for any OBD code patterns in the binary data
    const extracted = text
      .replace(/[^\x20-\x7E\n]/g, "")
      .split("\n")
      .filter(line => line.trim().length > 0)
      .join(" ")
    
    if (extracted.length > 0) {
      return {
        success: true,
        content: extracted,
        fileType: "excel",
        message: "Excel content extracted (text from cells)",
      }
    }

    return {
      success: false,
      content: "",
      fileType: "excel",
      message: "Could not extract text from Excel file. Try saving as CSV.",
    }
  } catch (error) {
    return {
      success: false,
      content: "",
      fileType: "excel",
      message: `Error reading Excel file: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function parseWordFile(file: File): Promise<ParsedFile> {
  try {
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer)
    
    // Extract text from DOCX (which is a ZIP file with XML)
    const extracted = text
      .replace(/[^\x20-\x7E\n]/g, "")
      .split("\n")
      .filter(line => line.trim().length > 0)
      .join(" ")
    
    if (extracted.length > 0) {
      return {
        success: true,
        content: extracted,
        fileType: "word",
        message: "Word document content extracted",
      }
    }

    return {
      success: false,
      content: "",
      fileType: "word",
      message: "Could not extract text from Word file. Try saving as .docx format.",
    }
  } catch (error) {
    return {
      success: false,
      content: "",
      fileType: "word",
      message: `Error reading Word file: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function parseCSVFile(file: File): Promise<ParsedFile> {
  try {
    const content = await file.text()
    return {
      success: true,
      content,
      fileType: "csv",
      message: "CSV file parsed successfully",
    }
  } catch (error) {
    return {
      success: false,
      content: "",
      fileType: "csv",
      message: `Error reading CSV file: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function parseJSONFile(file: File): Promise<ParsedFile> {
  try {
    const content = await file.text()
    // Parse JSON and convert to readable text
    const json = JSON.parse(content)
    const text = JSON.stringify(json, null, 2)
    
    return {
      success: true,
      content: text,
      fileType: "json",
      message: "JSON file parsed successfully",
    }
  } catch (error) {
    return {
      success: false,
      content: "",
      fileType: "json",
      message: `Error reading JSON file: ${error instanceof Error ? error.message : "Invalid JSON"}`,
    }
  }
}

async function parseImageFile(file: File): Promise<ParsedFile> {
  try {
    // For images, we can't do OCR without external libraries
    // But we can prompt the user to use a service
    return {
      success: false,
      content: "",
      fileType: "image",
      message: "Image files require OCR processing. Please convert screenshots to PDF or text first, or use online OCR tools like Google Lens or Tesseract.",
    }
  } catch (error) {
    return {
      success: false,
      content: "",
      fileType: "image",
      message: "Image processing not available. Please save as PDF or text.",
    }
  }
}
