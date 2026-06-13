import { useState, useEffect } from "react";
import { Folder, Upload, FileText, Trash2, Download, Search, HardDrive, Loader2, Image as ImageIcon, FileCheck, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export function DocumentManager() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/documents.php", { credentials: "include" });
      const json = await res.json();
      if (json.success) setDocuments(json.data.documents);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch("/api/crm/documents.php", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.success) fetchDocs();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = documents.filter(d => 
    d.document_name?.toLowerCase().includes(search.toLowerCase()) || 
    d.document_type?.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('image') || t.includes('png') || t.includes('jpg') || t.includes('jpeg')) return <ImageIcon className="w-5 h-5 text-blue-600" />;
    if (t.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />;
    if (t.includes('zip') || t.includes('rar')) return <FileArchive className="w-5 h-5 text-amber-600" />;
    if (t.includes('contract') || t.includes('agreement')) return <FileCheck className="w-5 h-5 text-emerald-600" />;
    return <FileText className="w-5 h-5 text-indigo-600" />;
  };

  const getFileBg = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('image') || t.includes('png') || t.includes('jpg') || t.includes('jpeg')) return 'bg-blue-50 border-blue-100';
    if (t.includes('pdf')) return 'bg-red-50 border-red-100';
    if (t.includes('zip') || t.includes('rar')) return 'bg-amber-50 border-amber-100';
    if (t.includes('contract') || t.includes('agreement')) return 'bg-emerald-50 border-emerald-100';
    return 'bg-indigo-50 border-indigo-100';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Folder className="w-6 h-6" />
            </div>
            Document Hub
          </h2>
          <p className="text-gray-500 font-medium mt-2">Central storage for case files, contracts, and digital assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl font-bold text-gray-700 bg-white hover:bg-gray-50 shadow-sm border-gray-200">
            <HardDrive className="w-4 h-4 mr-2 text-indigo-600" /> Storage
          </Button>
          <Button className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 font-bold px-6 transition-all active:scale-95">
            <Upload className="w-4 h-4 mr-2" /> Upload File
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 p-2 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Search documents by name, type, or case ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 border-none bg-transparent focus-visible:ring-0 text-base shadow-none"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Document Name</th>
              <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Type</th>
              <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Related Case</th>
              <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Date Added</th>
              <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <p className="font-medium">Loading documents...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <Folder className="w-10 h-10 text-gray-300" />
                      </div>
                      <p className="text-lg font-medium text-gray-500">No documents found</p>
                      <p className="text-sm">Try adjusting your search or upload a new file.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((doc, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={doc.id} 
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getFileBg(doc.document_type)}`}>
                          {getFileIcon(doc.document_type)}
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{doc.document_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                        {doc.document_type || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.case_id ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                          #{doc.case_id}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(doc.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-8 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 font-medium">
                            <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                          </Button>
                        </a>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)} className="h-8 w-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
