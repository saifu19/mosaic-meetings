import { InsightType } from '@/types';
import { Brain, Lightbulb, Flag } from 'lucide-react';
import * as marked from 'marked';

export const getInsightIcon = (type: InsightType) => {
    switch (type) {
        case 'requirements':
            return <Brain className="h-5 w-5" />;
        case 'context':
            return <Lightbulb className="h-5 w-5" />;
        case 'action_items':
        case 'summary':
            return <Flag className="h-5 w-5" />;
    }
};

export const getInsightColor = (type: InsightType) => {
    switch (type) {
        case 'requirements':
            return 'text-purple-500 bg-purple-50';
        case 'context':
            return 'text-yellow-500 bg-yellow-50';
        case 'action_items':
            return 'text-blue-500 bg-blue-50';
        case 'summary':
            return 'text-green-500 bg-green-50';
    }
};

export const isValidJSON = (str: string): boolean => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}; 

export const formatInsightContent = (content: string): string => {
    try {
        // First unescape any escaped characters
        let unescapedContent = content
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\/g, '');

        unescapedContent = unescapedContent.replace('u2019', "'");
        unescapedContent = unescapedContent.startsWith('"') && unescapedContent.endsWith('"') ? unescapedContent.slice(1, -1) : unescapedContent;
        // Configure marked options
        marked.marked.setOptions({
            breaks: true,
            gfm: true,
            async: false
        });

        const htmlContent = marked.marked.parse(unescapedContent, { async: false }) as string;
        
        // Add custom styling and handle specific markdown elements
        return htmlContent
            .replace(/<h1>/g, '<h1 class="text-xl font-bold mb-2">')
            .replace(/<h2>/g, '<h2 class="text-lg font-semibold mb-2">')
            .replace(/<h3>/g, '<h3 class="text-md font-semibold mb-1">')
            .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-4">')
            .replace(/<li>/g, '<li class="mb-1">')
            .replace(/<p>/g, '<p class="mb-4">')
            .replace(/\[Not Specified\]/g, '<span class="text-gray-500">Not Specified</span>')
            .replace(/<strong>(.*?)<\/strong>/g, '<strong class="font-semibold">$1</strong>');
    } catch (error) {
        console.error('Error formatting markdown:', error);
        return content;
    }
};