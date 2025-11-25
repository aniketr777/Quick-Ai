
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareDialog from './ShareDialog';

const ShareButton = ({ title = "Check this out!", text = "Try Quick AI today", url = window.location.href, className = "", iconSize = 16 }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleShare = async (e) => {
        e.stopPropagation(); // Prevent parent click events (like card clicks)

        // 1. Construct the Share Data object
        const shareData = {
            title: title,
            text: text,
            url: url,
        };

        try {
            // 2. Attempt Native Sharing (Mobile Share Sheet)
            if (navigator.share) {
                await navigator.share(shareData);
                console.log('Shared successfully');
            } else {
                // Browser doesn't support the API (e.g., Desktop Chrome)
                throw new Error('Web Share API not supported');
            }
        } catch (error) {
            // 3. Fallback Logic
            console.log('Native share failed or closed. Opening fallback...');
            setIsDialogOpen(true);
        }
    };

    return (
        <>
            <button
                onClick={handleShare}
                className={className}
            >
                <Share2 size={iconSize} />
                {/* <span>Share</span> */}
            </button>

            <ShareDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                url={url}
                title="Share"
            />
        </>
    );
};

export default ShareButton;