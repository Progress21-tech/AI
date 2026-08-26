'use client';

import { useState } from 'react';
import { ArrowRight, Building2, UserRound } from 'lucide-react';

export type CompanyInfo = {
    companyName: string;
    respondentName?: string;
    respondentRole?: string;
    respondentEmail?: string;
    respondentPhone?: string;
};

type CompanyIdentityStepProps = {
    onSubmit: (values: CompanyInfo) => Promise<void> | void;
    isLoading?: boolean;
};

const initialState: CompanyInfo = {
    companyName: '',
    respondentName: '',
    respondentRole: '',
    respondentEmail: '',
    respondentPhone: '',
};

export function CompanyIdentityStep({ onSubmit, isLoading = false }: CompanyIdentityStepProps) {
    const [values, setValues] = useState<CompanyInfo>(initialState);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: keyof CompanyInfo, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const companyName = values.companyName.trim();

        if (!companyName) {
            setError('Company name is required to begin the discovery interview.');
            return;
        }

        setError(null);
        await onSubmit({
            companyName,
            respondentName: values.respondentName?.trim() || undefined,
            respondentRole: values.respondentRole?.trim() || undefined,
            respondentEmail: values.respondentEmail?.trim() || undefined,
            respondentPhone: values.respondentPhone?.trim() || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto rounded-[28px] border border-borderDark bg-surface p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                    <Building2 className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-subtle">Get started</p>
                    <h2 className="text-2xl font-bold tracking-tight text-black">Tell us who you are.</h2>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="companyName" className="text-xs font-mono uppercase tracking-[0.12em] text-subtle">
                        Company Name
                    </label>
                    <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={values.companyName}
                        onChange={(event) => handleChange('companyName', event.target.value)}
                        placeholder="Enter company name"
                        className="w-full rounded-2xl border border-borderDark bg-white px-4 py-3 text-sm text-black placeholder:text-subtle focus:border-black focus:outline-none"
                        autoComplete="organization"
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="respondentName" className="text-xs font-mono uppercase tracking-[0.12em] text-subtle">
                        Your Name (optional)
                    </label>
                    <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                        <input
                            id="respondentName"
                            name="respondentName"
                            type="text"
                            value={values.respondentName}
                            onChange={(event) => handleChange('respondentName', event.target.value)}
                            placeholder="Your name"
                            className="w-full rounded-2xl border border-borderDark bg-white py-3 pl-10 pr-4 text-sm text-black placeholder:text-subtle focus:border-black focus:outline-none"
                            autoComplete="name"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="respondentRole" className="text-xs font-mono uppercase tracking-[0.12em] text-subtle">
                        Role (optional)
                    </label>
                    <input
                        id="respondentRole"
                        name="respondentRole"
                        type="text"
                        value={values.respondentRole}
                        onChange={(event) => handleChange('respondentRole', event.target.value)}
                        placeholder="Owner / Director / Manager / Other"
                        className="w-full rounded-2xl border border-borderDark bg-white px-4 py-3 text-sm text-black placeholder:text-subtle focus:border-black focus:outline-none"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="respondentEmail" className="text-xs font-mono uppercase tracking-[0.12em] text-subtle">
                            Email (optional)
                        </label>
                        <input
                            id="respondentEmail"
                            name="respondentEmail"
                            type="email"
                            value={values.respondentEmail}
                            onChange={(event) => handleChange('respondentEmail', event.target.value)}
                            placeholder="you@company.com"
                            className="w-full rounded-2xl border border-borderDark bg-white px-4 py-3 text-sm text-black placeholder:text-subtle focus:border-black focus:outline-none"
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="respondentPhone" className="text-xs font-mono uppercase tracking-[0.12em] text-subtle">
                            Phone (optional)
                        </label>
                        <input
                            id="respondentPhone"
                            name="respondentPhone"
                            type="tel"
                            value={values.respondentPhone}
                            onChange={(event) => handleChange('respondentPhone', event.target.value)}
                            placeholder="Optional contact number"
                            className="w-full rounded-2xl border border-borderDark bg-white px-4 py-3 text-sm text-black placeholder:text-subtle focus:border-black focus:outline-none"
                            autoComplete="tel"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span>{isLoading ? 'Starting interview...' : 'Continue'}</span>
                <ArrowRight className="h-4 w-4" />
            </button>
        </form>
    );
}
