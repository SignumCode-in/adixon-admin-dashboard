import React, { useRef } from 'react';
import { X, Printer, Download, Sparkles } from 'lucide-react';

export default function PdfPreviewModal({
  isOpen,
  onClose,
  type = 'prescription', // 'prescription' | 'certificate' | 'instruction' | 'consent'
  data = {},
  patient = {},
  clinic = {},
  doctor = {}
}) {
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Extract Clinic Settings (with fallbacks)
  const clinicName = clinic.name || clinic.clinicName || 'Adixon Medical Clinic';
  const tagline = clinic.tagline || '';
  const clinicAddress = clinic.address || '';
  const clinicPhone = clinic.phone || '';
  const clinicEmail = clinic.email || '';
  const clinicWebsite = clinic.website || '';
  const visitingHours = clinic.visit_hours || clinic.visitingHours || '09:00 AM - 08:00 PM';
  const openDays = clinic.open_days || clinic.openDays || 'Mon - Sat';

  const showLogo = clinic.is_logo ?? clinic.showLogoOnPdf ?? true;
  const showOpenDays = clinic.is_open_days ?? clinic.showOpenDaysOnPdf ?? true;
  const showVisitingHours = clinic.is_visiting_hours ?? clinic.showVisitingHoursOnPdf ?? true;
  const showStamp = clinic.is_stamp ?? clinic.showStampOnPdf ?? true;
  const showSignature = clinic.is_doctor_signature ?? clinic.showSignatureOnPdf ?? true;

  const logoUrl = clinic.logo_url || clinic.logoUrl || '';
  const signatureUrl = doctor.signature_url || clinic.doctor_signature_url || clinic.doctorSignatureUrl || '';
  const stampUrl = clinic.stamp_url || clinic.stampUrl || '';

  const doctorName = doctor.full_name || doctor.name || clinic.doctor_name || clinic.doctorName || 'Practitioner';
  const doctorQualification = doctor.qualification || clinic.doctor_qualification || clinic.doctorQualification || 'MBBS, MD';
  const doctorReg = doctor.registration_number || clinic.registration_number || clinic.registrationNumber || '';

  // Patient Info
  const patientName = patient.full_name || patient.name || data.patient_name || 'Patient';
  const patientGender = patient.gender || data.patient_gender || '';
  const patientAge = patient.age || data.patient_age || '';
  const patientAddress = patient.address || data.patient_address || '';
  const patientPhone = patient.phone || data.patient_phone || '';
  const issueDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type.toUpperCase()} - ${patientName}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              margin: 0;
              padding: 0;
              background: #fff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .pdf-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              box-sizing: border-box;
            }
            .header-border {
              border-bottom: 2px solid #0F766E;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .primary-text { color: #0F766E; }
            .badge-chip {
              background-color: #F1F5F9;
              border: 1px solid #E2E8F0;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
            }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="right-drawer-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '850px', 
          width: '90%', 
          maxHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '16px',
          overflow: 'hidden',
          padding: 0
        }}
      >
        {/* Header Action Bar */}
        <div style={{ padding: '14px 20px', background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>
              PDF Print Preview ({type.charAt(0).toUpperCase() + type.slice(1)})
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={15} /> Print / Save PDF
            </button>
            <button className="icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#525659', display: 'flex', justifyContent: 'center' }}>
          {/* Paper A4 Container */}
          <div 
            ref={printRef}
            style={{ 
              width: '100%', 
              maxWidth: '740px', 
              minHeight: '950px', 
              background: '#FFFFFF', 
              padding: '32px 36px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)', 
              borderRadius: '4px',
              fontFamily: 'Inter, -apple-system, sans-serif',
              color: '#0F172A',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              {/* CLINIC HEADER */}
              <div style={{ borderBottom: '2px solid #0F766E', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {showLogo && logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : showLogo ? (
                    <div style={{ width: '64px', height: '64px', background: '#0F766E', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                      Logo
                    </div>
                  ) : null}
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#0F172A' }}>
                      Dr. {doctorName}
                    </h2>
                    {doctorQualification && (
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{doctorQualification}</div>
                    )}
                    {doctorReg && (
                      <div style={{ fontSize: '11px', color: '#0F766E', marginTop: '2px' }}>
                        Reg. No: <u>{doctorReg}</u>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F172A', marginBottom: '2px' }}>{clinicName}</div>
                  {tagline && <div style={{ fontStyle: 'italic', marginBottom: '2px' }}>{tagline}</div>}
                  {clinicAddress && <div>{clinicAddress}</div>}
                  {showVisitingHours && visitingHours && <div>Visiting Hours: {visitingHours}</div>}
                  {showOpenDays && openDays && <div>Open: {openDays}</div>}
                  {clinicPhone && <div>Contact: {clinicPhone}</div>}
                  {clinicEmail && <div>Mail: {clinicEmail}</div>}
                  {clinicWebsite && <div>{clinicWebsite}</div>}
                </div>
              </div>

              {/* DOCUMENT TITLE HEADER */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F766E', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                  {type === 'prescription' ? 'PRESCRIPTION' 
                    : type === 'certificate' ? (data.certificate_type || 'MEDICAL CERTIFICATE')
                    : type === 'instruction' ? (data.title || 'PATIENT INSTRUCTION')
                    : (data.title || 'CONSENT AGREEMENT')}
                </h2>
                <div style={{ width: '60px', height: '2px', background: '#0F766E', margin: '4px auto 0' }} />
              </div>

              {/* PATIENT INFO BLOCK */}
              <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '10px 16px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div><strong>Patient:</strong> {patientName} {patientGender && `, ${patientGender}`} {patientAge && ` / ${patientAge} Yrs`}</div>
                  <div><strong>Date:</strong> {issueDate}</div>
                </div>
                {(patientAddress || patientPhone) && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '4px', fontSize: '11px', color: '#64748B' }}>
                    {patientAddress && <div>Address: {patientAddress}</div>}
                    {patientPhone && <div>Phone: {patientPhone}</div>}
                  </div>
                )}
              </div>

              {/* SECTION: PRESCRIPTION SPECIFIC (2 COLUMN LAYOUT) */}
              {type === 'prescription' && (
                <div style={{ display: 'flex', gap: '24px' }}>
                  {/* Left Column: Vitals & History */}
                  <div style={{ flex: 1, borderRight: '1px solid #E2E8F0', paddingRight: '16px', fontSize: '12px' }}>
                    {data.vitals && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontWeight: 'bold', color: '#0F766E', marginBottom: '6px', borderLeft: '3px solid #0F766E', paddingLeft: '6px' }}>
                          Vitals
                        </div>
                        {data.vitals.blood_pressure && <div style={{ marginBottom: '3px' }}>BP: <strong>{data.vitals.blood_pressure}</strong> mmHg</div>}
                        {data.vitals.pulse_rate && <div style={{ marginBottom: '3px' }}>Pulse: <strong>{data.vitals.pulse_rate}</strong> bpm</div>}
                        {data.vitals.temperature && <div style={{ marginBottom: '3px' }}>Temp: <strong>{data.vitals.temperature}</strong> °F</div>}
                        {data.vitals.spo2 && <div style={{ marginBottom: '3px' }}>SpO2: <strong>{data.vitals.spo2}</strong> %</div>}
                        {data.vitals.weight && <div style={{ marginBottom: '3px' }}>Weight: <strong>{data.vitals.weight}</strong> kg</div>}
                        {data.vitals.height && <div style={{ marginBottom: '3px' }}>Height: <strong>{data.vitals.height}</strong> cm</div>}
                      </div>
                    )}

                    {data.clinical && (
                      <div>
                        {data.clinical.chief_complaint && (
                          <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#0F766E' }}>Chief Complaint:</strong>
                            <div style={{ color: '#334155', marginTop: '2px' }}>{data.clinical.chief_complaint}</div>
                          </div>
                        )}
                        {data.clinical.diagnosis && (
                          <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#0F766E' }}>Diagnosis:</strong>
                            <div style={{ color: '#0F172A', fontWeight: 'bold', marginTop: '2px' }}>{data.clinical.diagnosis}</div>
                          </div>
                        )}
                        {data.clinical.patient_history && (
                          <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#0F766E' }}>Patient History:</strong>
                            <div style={{ color: '#475569', marginTop: '2px' }}>{data.clinical.patient_history}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Rx Medicines & Advice */}
                  <div style={{ flex: 1.6, fontSize: '12px' }}>
                    {data.medicines && data.medicines.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0F766E', marginBottom: '10px' }}>
                          Rx (Medicines)
                        </div>
                        {data.medicines.map((m, idx) => (
                          <div key={idx} style={{ marginBottom: '12px', borderBottom: '1px dashed #E2E8F0', paddingBottom: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0F172A' }}>
                              {idx + 1}. {m.name} {m.quantity ? ` (Qty: ${m.quantity})` : ''}
                            </div>
                            <div style={{ color: '#475569', fontSize: '11px', marginTop: '3px' }}>
                              {[m.frequency, m.instruction, m.no_of_days ? `for ${m.no_of_days} Days` : null, m.route ? `(${m.route})` : null].filter(Boolean).join(' • ')}
                            </div>
                            {m.additional_comments && (
                              <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                Note: {m.additional_comments}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {data.labs && data.labs.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontWeight: 'bold', color: '#0F766E', marginBottom: '6px' }}>Advice / Lab Tests:</div>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155', fontSize: '11px' }}>
                          {data.labs.map((l, lIdx) => (
                            <li key={lIdx} style={{ marginBottom: '3px' }}>{typeof l === 'string' ? l : l.name || l.lab_test}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.clinical?.notes && (
                      <div style={{ marginTop: '12px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', color: '#475569' }}>
                        <strong>Doctor Notes:</strong> {data.clinical.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: CERTIFICATE SPECIFIC */}
              {type === 'certificate' && (
                <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#0F172A', marginTop: '20px' }}>
                  {data.duration && (
                    <div style={{ marginBottom: '14px', background: '#F1F5F9', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-block' }}>
                      Duration / Leave: {data.duration}
                    </div>
                  )}

                  <div style={{ whiteSpace: 'pre-line', marginBottom: '20px' }}>
                    {data.content || 'This is to certify that the patient has been examined and advised recovery rest.'}
                  </div>

                  {data.remark && (
                    <div style={{ marginTop: '16px', borderLeft: '3px solid #0F766E', paddingLeft: '12px', fontStyle: 'italic', color: '#475569' }}>
                      <strong>Remarks / Diagnosis:</strong> {data.remark}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: INSTRUCTION SPECIFIC */}
              {type === 'instruction' && (
                <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#0F172A', marginTop: '20px' }}>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {data.description || data.content || 'Please follow all medical guidelines as instructed.'}
                  </div>
                </div>
              )}

              {/* SECTION: CONSENT SPECIFIC */}
              {type === 'consent' && (
                <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#0F172A', marginTop: '20px' }}>
                  <div style={{ whiteSpace: 'pre-line', marginBottom: '30px' }}>
                    {data.content || 'I hereby give full consent to the medical procedure and treatment as explained by the practitioner.'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                    <div style={{ border: '1px solid #CBD5E1', padding: '12px 18px', borderRadius: '8px', minWidth: '180px', textAlign: 'center' }}>
                      {data.patient_signature ? (
                        <img src={data.patient_signature} alt="Patient Sig" style={{ height: '40px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '11px' }}>Signature</div>
                      )}
                      <div style={{ borderTop: '1px solid #94A3B8', marginTop: '8px', paddingTop: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        Patient / Guardian Signature
                      </div>
                    </div>

                    <div style={{ border: '1px solid #CBD5E1', padding: '12px 18px', borderRadius: '8px', minWidth: '180px', textAlign: 'center' }}>
                      {signatureUrl ? (
                        <img src={signatureUrl} alt="Doctor Sig" style={{ height: '40px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '11px' }}>Signature</div>
                      )}
                      <div style={{ borderTop: '1px solid #94A3B8', marginTop: '8px', paddingTop: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        Dr. {doctorName}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SIGNATURE & STAMP FOOTER */}
            <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  {showStamp && stampUrl ? (
                    <img src={stampUrl} alt="Stamp" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                  ) : null}
                </div>

                {type !== 'consent' && showSignature && (
                  <div style={{ textAlign: 'center', minWidth: '160px' }}>
                    {signatureUrl ? (
                      <img src={signatureUrl} alt="Doctor Signature" style={{ height: '44px', objectFit: 'contain', marginBottom: '4px' }} />
                    ) : (
                      <div style={{ height: '30px' }} />
                    )}
                    <div style={{ borderTop: '1px solid #64748B', width: '130px', margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F172A' }}>Dr. {doctorName}</div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>{doctorQualification}</div>
                    {doctorReg && <div style={{ fontSize: '10px', color: '#64748B' }}>Reg: {doctorReg}</div>}
                  </div>
                )}
              </div>

              {/* FOOTER STRIP */}
              <div style={{ marginTop: '16px', padding: '8px 12px', background: '#F8FAFC', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B' }}>
                <div>{clinicWebsite || `${clinicName} • Contact: ${clinicPhone}`}</div>
                <div>Generated by Adixon Clinic OS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
