import { AddChildDialog } from '@/components/AddChildDialog';
import { ChildList } from '@/components/ChildList';
import { ClipboardList } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Case Management</h1>
                <p className="text-muted-foreground">Clinical case records for child welfare</p>
              </div>
            </div>
            <AddChildDialog />
          </div>
        </header>

        {/* Main Content */}
        <main>
          <section>
            <h2 className="text-lg font-semibold mb-4 text-foreground">All Cases</h2>
            <ChildList />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
