// frontend/src/pages/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMyProjectsQuery } from '@/features/project/projectApi';
import {
  useGetPendingInvitesQuery,
  useAcceptInviteMutation,
  useRejectInviteMutation,
  useCreateProjectMutation,
} from '@/features/project/projectApi';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Clock, AlertCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/common/Header';
import { formatDistanceToNow } from 'date-fns';

const projectSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  visibility: z.enum(['public', 'private']),
  language: z.enum(['javascript', 'python', 'java', 'other']),
});

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: projects = [], isLoading: projectsLoading } =
    useGetMyProjectsQuery();
  const { data: pendingInvites = [], isLoading: invitesLoading } =
    useGetPendingInvitesQuery();

  const [createProject, { isLoading: creating }] =
    useCreateProjectMutation();
  const [acceptInvite] = useAcceptInviteMutation();
  const [rejectInvite] = useRejectInviteMutation();

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      visibility: 'private',
      language: 'javascript',
    },
  });

  const onCreateSubmit = async (values) => {
    try {
      const project = await createProject(values).unwrap();
      toast.success('Project created successfully');
      setOpenCreateModal(false);
      form.reset();
      navigate(`/projects/${project._id}`);
    } catch (err) {
      toast.error(
        'Failed to create project: ' + (err.data?.message || 'Unknown error')
      );
    }
  };

  const handleAcceptInvite = async (membershipId) => {
    try {
      await acceptInvite(membershipId).unwrap();
      toast.success('Joined project');
    } catch {
      toast.error('Failed to accept invite');
    }
  };

  const handleRejectInvite = async (membershipId) => {
    try {
      await rejectInvite(membershipId).unwrap();
      toast.success('Invite rejected');
    } catch {
      toast.error('Failed to reject invite');
    }
  };

  return (
    <div className="min-h-screen bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Projects</h1>

          <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} /> New Project
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up your collaborative workspace.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={form.handleSubmit(onCreateSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="My Awesome App"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="A brief description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select
                      value={form.watch('visibility')}
                      onValueChange={(val) => form.setValue('visibility', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Private" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Language</Label>
                    <Select
                      value={form.watch('language')}
                      onValueChange={(val) => form.setValue('language', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="JavaScript" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">
                          JavaScript/Node.js
                        </SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Project'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first project to start collaborating.
            </p>
            <Button onClick={() => setOpenCreateModal(true)}>Create Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                    <Badge
                      variant={project.visibility === 'public' ? 'default' : 'secondary'}
                    >
                      {project.visibility}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {project.description || 'No description'}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{project.memberCount || 1} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        Updated{' '}
                        {formatDistanceToNow(new Date(project.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t text-xs text-muted-foreground">
                  Role: {project.myRole || 'editor'}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pending Invites */}
        {!invitesLoading && pendingInvites.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-semibold">Pending Invites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingInvites.map((invite) => (
                <Card key={invite._id} className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">{invite.project?.name}</CardTitle>
                    <CardDescription>
                      Invited by {invite.fromUser?.username}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm">
                      {invite.project?.description?.slice(0, 100) || 'No description'}...
                    </p>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectInvite(invite._id)}
                    >
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleAcceptInvite(invite._id)}>
                      Accept & Join
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;