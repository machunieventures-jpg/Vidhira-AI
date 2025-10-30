// Add type definitions for the global variables from script tags to satisfy TypeScript
declare global {
  const html2canvas: any;
  const jspdf: any;
}

/**
 * Exports the main report content as a multi-page PDF.
 * @param userName The user's full name for the filename.
 */
export const exportReportAsPDF = async (userName: string): Promise<void> => {
  const reportElement = document.getElementById('report-container');

  if (!reportElement) {
    console.error('Report container element not found for PDF export.');
    throw new Error('Could not find the report content to export.');
  }

  try {
    // Use html2canvas to capture the report element
    const canvas = await html2canvas(reportElement, {
      scale: 2, // Use a higher scale for better resolution
      useCORS: true,
      backgroundColor: '#0D1117', // Match the app's background color
      // Ensure the whole element is captured, not just the visible part
      windowWidth: reportElement.scrollWidth,
      windowHeight: reportElement.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    // Initialize jsPDF for an A4 document
    const pdf = new jspdf.jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate the image height in the PDF to maintain aspect ratio
    const ratio = canvasWidth / pdfWidth;
    const imgHeight = canvasHeight / ratio;

    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add new pages if the content is longer than one page
    while (heightLeft > 0) {
      position -= pdfHeight; // Move the "viewport" down on the single large image
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Sanitize user name for the file name
    const fileName = `Vidhira_Report_${userName.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('An unexpected error occurred while creating the PDF file.');
  }
};
