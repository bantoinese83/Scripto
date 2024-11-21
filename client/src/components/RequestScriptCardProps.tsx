import React from 'react';
import { ScriptRequest } from '../types';
import { FileText, Tag as TagIcon, Code, BadgeCheck } from 'lucide-react';
import Tag from './Tag';
import FulfillRequestButton from './FulfillRequestButtonProps.tsx';

interface RequestScriptCardProps {
    request: ScriptRequest;
    onRequestFulfilled: (requestId: string) => void;
}

const RequestScriptCard: React.FC<RequestScriptCardProps> = ({ request, onRequestFulfilled }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 relative flex flex-col justify-between">
            <div
                className="absolute top-0 left-0 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-tr-lg rounded-bl-lg">
                Requested Script
            </div>
            {request.is_fulfilled ? (
                <div
                    className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-tl-lg rounded-br-lg flex items-center gap-1">
                    <BadgeCheck className="w-4 h-4" />
                    Completed
                </div>
            ) : (
                <div className="mt-4">
                    <FulfillRequestButton request={request} onUploadSuccess={() => onRequestFulfilled(request.id)} />
                </div>
            )}
            <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 mt-6">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    {request.title}
                </h3>
                <p className="text-gray-700 mt-2">{request.description}</p>
                <div className="mt-4">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Code className="w-4 h-4 text-gray-500" />
                        Language: {request.language}
                    </p>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <TagIcon className="w-4 h-4 text-gray-500" />
                        Tags:
                        <div className="flex flex-wrap gap-2">
                            {request.tags.split(',').map((tag, index) => (
                                <Tag key={index} tag={tag.trim()} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestScriptCard;