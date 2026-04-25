import Link from 'next/link';
import { format } from 'date-fns';
import { AlertCircleIcon, ClipboardListIcon, GitPullRequestIcon, UsersIcon } from 'lucide-react';

import { requireStaff } from '@/lib/auth-helpers';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PRIORITY_LABELS } from '@/lib/constants';
import { getDashboardStats } from './data';

export default async function DashboardPage() {
  const session = await requireStaff();
  const first = session.user.firstname?.trim() || session.user.email;
  const stats = await getDashboardStats();

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <p className="text-muted-foreground text-sm">
          Welcome back, <span className="font-medium text-foreground">{first}</span>
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Open incidents"
            value={stats.openIncidents}
            icon={<AlertCircleIcon className="size-4 text-muted-foreground" />}
            href="/incidents"
          />
          <StatCard
            title="Open service requests"
            value={stats.openRequests}
            icon={<ClipboardListIcon className="size-4 text-muted-foreground" />}
            href="/requests"
          />
          <StatCard
            title="Open change requests"
            value={stats.openChanges}
            icon={<GitPullRequestIcon className="size-4 text-muted-foreground" />}
            href="/change"
          />
          <StatCard
            title="Active users"
            value={stats.totalUsers}
            icon={<UsersIcon className="size-4 text-muted-foreground" />}
            href="/users"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Open incidents by priority</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.priorityBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open incidents.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {stats.priorityBreakdown.map((row) => (
                    <li key={row.label} className="flex items-center gap-3 text-sm">
                      <span className="w-20 text-muted-foreground">{row.label}</span>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.round((row.count / stats.openIncidents) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-6 text-right font-medium">{row.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent open incidents</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentIncidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open incidents.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentIncidents.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono">
                          <Link href={`/incidents/${t.id}`} className="hover:underline">
                            #{t.id}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-40 truncate">
                          <Link href={`/incidents/${t.id}`} className="hover:underline">
                            {t.summary}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {PRIORITY_LABELS[t.priority] ?? t.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {format(t.createdAt, 'PP')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
