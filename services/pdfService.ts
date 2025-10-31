// Add type definitions for the global variables from script tags to satisfy TypeScript
declare global {
  const html2canvas: any;
  const jspdf: any;
}

export interface PdfExportOptions {
  sections: string[];
  theme: 'dark' | 'light';
}

/**
 * Exports the main report content as a multi-page PDF with customizations.
 * @param userName The user's full name for the filename.
 * @param options The customization options for the PDF.
 */
export const exportReportAsPDF = async (userName: string, options: PdfExportOptions): Promise<void> => {
  const { sections, theme } = options;
  const reportElement = document.getElementById('report-container');

  if (!reportElement) {
    console.error('Report container element not found for PDF export.');
    throw new Error('Could not find the report content to export.');
  }

  // --- Pre-computation DOM modifications ---
  const allSectionElements = Array.from(reportElement.querySelectorAll('.report-section'));
  const sectionsToHide: HTMLElement[] = [];

  allSectionElements.forEach(sectionEl => {
    const sectionKey = (sectionEl as HTMLElement).dataset.sectionKey;
    if (!sectionKey || !sections.includes(sectionKey)) {
      sectionsToHide.push(sectionEl as HTMLElement);
      (sectionEl as HTMLElement).style.display = 'none';
    }
  });

  if (theme === 'light') {
    document.body.classList.add('pdf-light-theme');
  }
  // --- End of DOM modifications ---

  try {
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: theme === 'light' ? '#ffffff' : '#0D1117',
      windowWidth: reportElement.scrollWidth,
      windowHeight: reportElement.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const ratio = canvasWidth / pdfWidth;
    const imgHeight = canvasHeight / ratio;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const fileName = `Vidhira_Report_${userName.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('An unexpected error occurred while creating the PDF file.');
  } finally {
    // --- IMPORTANT: Cleanup DOM modifications ---
    sectionsToHide.forEach(el => {
      el.style.display = ''; // Revert to default display style
    });
    if (theme === 'light') {
      document.body.classList.remove('pdf-light-theme');
    }
    // --- End of cleanup ---
  }
};