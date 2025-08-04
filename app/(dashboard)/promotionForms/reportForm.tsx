import { useAtom, useSetAtom } from "jotai";
import { isReportingAtom } from "../profile/atom_state";
import { useState } from "react";
import useSWR from "swr";
import { User } from "@/lib/db/schema";
import { toast } from "react-toastify";
import Error from "next/error";

export default function ReportForm({ productId }: { productId: number }) {
  const [isReporting, setIsReporting] = useAtom(isReportingAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [success, setSuccess] = useState(false);

  const fetcher = (url: string) => fetch(url).then((r) => r.json())
  const {data: user } = useSWR<User>('/api/user', fetcher);

  const reportPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/product/report', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          userId: user?.id, // Replace with actual user ID
          message: `${reportReason}: ${message}`,
        })
      });


      if (response.ok) {
        setSuccess(true);
      } else if (response.status === 400) {
          toast.info("You have already submitted a report, if there is an issue, please contact us");
          return;
      } else {
          toast.error("There was an error submitting your report. Error: ")
      }
    } catch (error) {
        toast.error("there was an error submitting your report, Error: ")
    } finally {
        setMessage("");
        setReportReason("");
        setIsSubmitting(false);
        setIsReporting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Submitted</h3>
            <p className="text-sm text-gray-500">Thank you for helping improve our community.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                    setSuccess(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    isReporting &&
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Report Content</h2>
            <p className="text-sm text-gray-500 mt-1">Help us understand the issue</p>
          </div>
          <button
            onClick={() => setIsReporting(false)}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={reportPromotion} className="mt-4 space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for reporting
            </label>
            <select
              id="reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a reason</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="Misleading information">Misleading information</option>
              <option value="Spam or scam">Spam or scam</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Additional details
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide more information about your report..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReporting(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}