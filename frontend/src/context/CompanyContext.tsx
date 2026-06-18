import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { companiesApi } from '../api/companies';
import type { Company, CompanyInput } from '../types';

const STORAGE_KEY = 'smartwarehouse-company-id';

interface CompanyContextValue {
  companies: Company[];
  companyId: string | null;
  selectedCompany: Company | null;
  companiesLoading: boolean;
  setCompanyId: (id: string | null) => void;
  refreshCompanies: () => Promise<void>;
  createCompany: (input: CompanyInput) => Promise<Company>;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

function readStoredCompanyId(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || null;
  } catch {
    return null;
  }
}

function writeStoredCompanyId(id: string | null): void {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyIdState] = useState<string | null>(null);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const refreshCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const list = await companiesApi.getAll();
      setCompanies(list);
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const list = await companiesApi.getAll();
        if (cancelled) return;

        setCompanies(list);
        const stored = readStoredCompanyId();
        if (stored && list.some((c) => c.code === stored)) {
          setCompanyIdState(stored);
        } else {
          setCompanyIdState(null);
          writeStoredCompanyId(null);
        }
      } catch {
        if (!cancelled) {
          setCompanies([]);
          setCompanyIdState(null);
        }
      } finally {
        if (!cancelled) {
          setCompaniesLoading(false);
          setInitialized(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setCompanyId = useCallback((id: string | null) => {
    setCompanyIdState(id);
    writeStoredCompanyId(id);
  }, []);

  const createCompany = useCallback(
    async (input: CompanyInput) => {
      const created = await companiesApi.create(input);
      await refreshCompanies();
      setCompanyId(created.code);
      return created;
    },
    [refreshCompanies, setCompanyId],
  );

  const selectedCompany = useMemo(
    () => (companyId ? companies.find((c) => c.code === companyId) ?? null : null),
    [companies, companyId],
  );

  const value = useMemo(
    () => ({
      companies,
      companyId: initialized ? companyId : null,
      selectedCompany: initialized ? selectedCompany : null,
      companiesLoading,
      setCompanyId,
      refreshCompanies,
      createCompany,
    }),
    [
      companies,
      companyId,
      selectedCompany,
      companiesLoading,
      initialized,
      setCompanyId,
      refreshCompanies,
      createCompany,
    ],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within a CompanyProvider');
  return ctx;
}
