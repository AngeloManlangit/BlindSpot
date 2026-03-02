import html2canvas_jspdf from 'jspdf-html2canvas';

export const generateRiskReport = async (element: HTMLElement, fileName: string) => {
    try {
        await html2canvas_jspdf(element, {
            jsPDF: {
                unit: 'px',
                format: 'a4',
            },
            html2canvas: {
                scale: 2, // High resolution
                useCORS: true,
            },
            output: `${fileName}.pdf`,
        });
    } catch (error) {
        console.error("Failed to generate PDF:", error);
    }
};