<template>
  <div class="export-section">
    <button class="export-btn" @click="exportPdf" :disabled="!analysis || exporting">
      <svg
        v-if="!exporting"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <svg
        v-else
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="spin"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span>{{ exporting ? "Generating..." : "Export Survival Kit" }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { WeatherAnalysis } from "../../utils/useGemini";

const props = defineProps<{
  analysis: WeatherAnalysis | null;
  location: string;
}>();

const exporting = ref(false);

/**
 * Generate and download a PDF "Digital Survival Kit"
 * Uses jsPDF for browser-side PDF generation.
 */
const exportPdf = async () => {
  if (!props.analysis) return;

  exporting.value = true;

  try {
    // Dynamically import jsPDF (install via: npm i jspdf)
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const a = props.analysis;
    const now = new Date().toLocaleString();

    // --- Header ---
    doc.setFillColor(20, 20, 35);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("BLINDSPOT", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Digital Survival Kit", 14, 28);
    doc.text(`Generated: ${now}`, 14, 34);
    if (props.location) {
      doc.text(`Location: ${props.location}`, 120, 28);
    }

    // --- Body ---
    let y = 52;
    doc.setTextColor(30, 30, 30);

    // Vulnerability Score
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("VULNERABILITY ASSESSMENT", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Score: ${a.vulnerabilityScore} / 100`, 14, y);
    y += 6;
    doc.text(`System Status: ${a.systemStatus}`, 14, y);
    y += 6;
    doc.text(`Estimated Time to Restore: ${a.etr}`, 14, y);
    y += 12;

    // Critical Action
    doc.setFillColor(255, 235, 235);
    doc.roundedRect(14, y - 4, 182, 14, 3, 3, "F");
    doc.setTextColor(200, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.text(`⚡ CRITICAL ACTION: ${a.criticalAction}`, 18, y + 5);
    y += 20;

    // Advisories
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ADVISORIES", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Work: ${a.advisories.work}`, 14, y);
    y += 6;
    doc.text(`Commute: ${a.advisories.commute}`, 14, y);
    y += 6;
    doc.text(`School: ${a.advisories.school}`, 14, y);
    y += 12;

    // Offline Brief
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("CRISIS BRIEF", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const briefLines = doc.splitTextToSize(a.offlineBrief, 180);
    doc.text(briefLines, 14, y);
    y += briefLines.length * 6 + 8;

    // Detailed Analysis (pdfContent)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DETAILED ANALYSIS", 14, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const contentLines = doc.splitTextToSize(a.pdfContent, 180);
    // Handle page overflow
    for (const line of contentLines) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 5;
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `BlindSpot Digital Survival Kit — Page ${i} of ${pageCount}`,
        14,
        290
      );
    }

    // Download
    const filename = `BlindSpot_SurvivalKit_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("PDF export failed:", err);
    alert("Failed to generate PDF. Make sure jspdf is installed: npm i jspdf");
  } finally {
    exporting.value = false;
  }
};
</script>

<style scoped>
.export-section {
  padding-top: 4px;
}

.export-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(30, 144, 255, 0.15), rgba(0, 206, 209, 0.1));
  border: 1px solid rgba(30, 144, 255, 0.25);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.export-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(30, 144, 255, 0.25), rgba(0, 206, 209, 0.18));
  border-color: rgba(30, 144, 255, 0.4);
  transform: translateY(-1px);
}

.export-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
