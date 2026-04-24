import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { ArrowLeft, Upload, X, FileText } from 'lucide-react';
import { storage } from '../utils-new/storage';

export function SubmitResult() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const job = storage.getJobs().find(j => j.id === jobId);

  const handleFileUpload = () => {
    // Mock file upload
    const mockFile = `file_${Date.now()}.pdf`;
    if (files.length < 5) {
      setFiles([...files, mockFile]);
      showToast('File uploaded', 'success');
    } else {
      showToast('Maximum 5 files', 'warning');
    }
  };

  const removeFile = (file: string) => {
    setFiles(files.filter(f => f !== file));
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      showToast('Upload minimal 1 file', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (jobId) {
        storage.updateJob(jobId, { status: 'submitting' });
      }
      showToast('Hasil berhasil disubmit!', 'success');
      navigate('/my-jobs');
    }, 1500);
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <p className="text-gray-500">Job tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-8">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-gray-900">Submit Hasil</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Job Info */}
        <div className="bg-white rounded-[16px] p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Job</h3>
          <h4 className="font-semibold text-[#6366F1]">{job.title}</h4>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Files *
          </label>

          {/* Upload Area */}
          <button
            onClick={handleFileUpload}
            className="w-full bg-white border-2 border-dashed border-gray-300 rounded-[16px] p-8 hover:border-[#6366F1] hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Click to upload
            </p>
            <p className="text-xs text-gray-500">
              PDF, ZIP, Image (Max 20MB)
            </p>
          </button>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map(file => (
                <div
                  key={file}
                  className="bg-white rounded-[10px] p-3 flex items-center justify-between border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">{file}</span>
                  </div>
                  <button
                    onClick={() => removeFile(file)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan (Optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Tulis catatan tambahan untuk client..."
            rows={5}
            className="w-full bg-white border border-gray-200 rounded-[10px] px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={files.length === 0 || isSubmitting}
          className="w-full bg-[#6366F1] text-white rounded-[10px] py-4 font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Hasil'}
        </button>
      </div>
    </div>
  );
}
