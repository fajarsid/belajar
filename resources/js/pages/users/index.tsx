import { Form, Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { create, destroy, edit, index } from '@/routes/users';

type UserRow = {
    id: number;
    name: string;
    email: string;
    created_at: string;
};

type Paginator = {
    data: UserRow[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Filters = {
    search: string;
    sort: string;
    direction: 'asc' | 'desc';
};

const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'created_at', label: 'Created' },
];

export default function UsersIndex({
    users,
    filters,
}: {
    users: Paginator;
    filters: Filters;
}) {
    const sortBy = (key: string) => {
        const direction =
            filters.sort === key && filters.direction === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            index.url(),
            { search: filters.search || undefined, sort: key, direction },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Users" />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading title="Users" />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus /> Add user
                        </Link>
                    </Button>
                </div>

                <Form
                    action={index.url()}
                    method="get"
                    options={{ preserveState: true }}
                    className="flex max-w-md gap-2"
                >
                    <input type="hidden" name="sort" value={filters.sort} />
                    <input
                        type="hidden"
                        name="direction"
                        value={filters.direction}
                    />
                    <Input
                        type="search"
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search name or email"
                        aria-label="Search users"
                    />
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </Form>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.key} className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => sortBy(column.key)}
                                            className="inline-flex items-center gap-1 font-medium"
                                        >
                                            {column.label}
                                            {filters.sort === column.key &&
                                                (filters.direction === 'asc' ? (
                                                    <ArrowUp className="size-3" />
                                                ) : (
                                                    <ArrowDown className="size-3" />
                                                ))}
                                        </button>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        {filters.search
                                            ? 'No users match your search.'
                                            : 'No users yet.'}
                                    </td>
                                </tr>
                            )}
                            {users.data.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="px-4 py-3">{user.id}</td>
                                    <td className="px-4 py-3">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={edit(user.id)}>
                                                    <Pencil /> Edit
                                                </Link>
                                            </Button>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        data-test={`delete-user-${user.id}`}
                                                    >
                                                        <Trash2 /> Delete
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogTitle>
                                                        Delete {user.name}?
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        This permanently
                                                        deletes {user.email}.
                                                        This cannot be undone.
                                                    </DialogDescription>
                                                    <Form
                                                        {...destroy.form(
                                                            user.id,
                                                        )}
                                                    >
                                                        {({ processing }) => (
                                                            <DialogFooter className="gap-2">
                                                                <DialogClose
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        variant="secondary"
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </DialogClose>
                                                                <Button
                                                                    variant="destructive"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    data-test="confirm-delete-button"
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </DialogFooter>
                                                        )}
                                                    </Form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.links.length > 3 && (
                    <nav
                        className="flex flex-wrap gap-1"
                        aria-label="Pagination"
                    >
                        {users.links.map((link, position) =>
                            link.url ? (
                                <Button
                                    key={position}
                                    size="sm"
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    asChild
                                >
                                    <Link
                                        href={link.url}
                                        preserveState
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Button>
                            ) : (
                                <Button
                                    key={position}
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ),
                        )}
                    </nav>
                )}
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Users', href: index() }],
};
