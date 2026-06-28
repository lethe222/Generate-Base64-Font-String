import React, { useState } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    content: '',
    contact: '',
    rating: 3
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const API_URL = 'http://101.200.38.189:3000/api/feedback';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setMessage('请输入反馈内容');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.content,
          contact: formData.contact,
          rating: formData.rating
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('反馈提交成功！感谢您的反馈');
        setMessageType('success');
        setFormData({ content: '', contact: '', rating: 3 });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(result.message || '提交失败,请重试');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('网络错误,请检查网络连接');
      setMessageType('error');
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} style={{ color: "#7c5af6" }} />
            <h2 className="text-lg font-bold text-gray-900">用户反馈</h2>
          </div>
          <button
            onClick={onClose}
            title="关闭"
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Feedback Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              反馈内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="请输入您的反馈..."
              required
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 transition resize-none"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              联系方式 <span className="text-gray-400 font-normal">(选填)</span>
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              placeholder="邮箱或电话"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 transition"
            />
          </div>

          {/* Rating */}
          <div>
            <label htmlFor="rating-select" className="block text-sm font-semibold text-gray-800 mb-2">评分</label>
            <select 
              id="rating-select"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 transition"
            >
              <option value={5}>⭐⭐⭐⭐⭐ 非常满意</option>
              <option value={4}>⭐⭐⭐⭐ 满意</option>
              <option value={3}>⭐⭐⭐ 一般</option>
              <option value={2}>⭐⭐ 不满意</option>
              <option value={1}>⭐ 非常不满意</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: submitting
                ? "linear-gradient(135deg, #a78bfa, #c4b5fd)"
                : "linear-gradient(135deg, #7c6ef2, #a78bfa)",
              boxShadow: submitting ? "none" : "0 4px 14px rgba(124,110,242,0.3)",
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                提交中...
              </>
            ) : (
              '提交反馈'
            )}
          </button>

          {/* Message */}
          {message && (
            <div 
              className={`text-sm text-center py-2 px-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;
