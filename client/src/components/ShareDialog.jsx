import React, { useState } from 'react';
import { X, Mail, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

function ShareDialog({ isOpen, onClose, url, title = "Share Link" }) {
    if (!isOpen) return null;

    // Use the provided URL or fallback to current page
    const shareUrl = url || window.location.href;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Options Grid */}
                <div className="p-6 grid grid-cols-3 gap-4">

                    {/* WhatsApp */}
                    <SocialButton
                        label="WhatsApp"
                        color="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
                        onClick={() => {
                            const text = encodeURIComponent(`Check this out: ${shareUrl}`);
                            window.open(`https://wa.me/?text=${text}`, '_blank');
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    </SocialButton>

                    {/* Twitter / X */}
                    <SocialButton
                        label="X / Twitter"
                        color="bg-white/10 text-white hover:bg-white/20"
                        onClick={() => {
                            const text = encodeURIComponent("Check this out!");
                            const u = encodeURIComponent(shareUrl);
                            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${u}`, '_blank');
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </SocialButton>

                    {/* Email */}
                    <SocialButton
                        label="Email"
                        color="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        onClick={() => {
                            const subject = encodeURIComponent("Check this out");
                            const body = encodeURIComponent(`Here is the link: ${shareUrl}`);
                            window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                        }}
                    >
                        <Mail className="w-6 h-6" />
                    </SocialButton>

                </div>

                {/* Copy Link Section */}
                <div className="p-5 bg-zinc-950/50 border-t border-zinc-800">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Page Link
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 truncate flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                            {shareUrl}
                        </div>
                        <CopyButton textToCopy={shareUrl} />
                    </div>
                </div>

            </div>
        </div>
    );
}

function SocialButton({ children, label, color, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 group"
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform transform group-hover:scale-110 group-active:scale-95 ${color}`}>
                {children}
            </div>
            <span className="text-xs font-medium text-zinc-400 group-hover:text-white">
                {label}
            </span>
        </button>
    );
}

function CopyButton({ textToCopy }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => toast.error("Failed to copy"));
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2
         ${copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                }`}
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
    );
}

export default ShareDialog;
