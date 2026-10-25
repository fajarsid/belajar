<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a searchable, sortable, paginated list of users.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $sort = in_array($request->query('sort'), ['id', 'name', 'email', 'created_at'], true)
            ? $request->query('sort')
            : 'id';
        $direction = $request->query('direction') === 'desc' ? 'desc' : 'asc';

        $users = User::query()
            ->select(['id', 'name', 'email', 'created_at'])
            ->when($search !== '', function ($query) use ($search) {
                $escaped = addcslashes($search, '\%_');

                $query->where(function ($query) use ($escaped) {
                    $query->where('name', 'like', "%{$escaped}%")
                        ->orWhere('email', 'like', "%{$escaped}%");
                });
            })
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => ['search' => $search, 'sort' => $sort, 'direction' => $direction],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('users/create');
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created.')]);

        return to_route('users.index');
    }

    /**
     * Show the form for editing the given user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'user' => $user->only(['id', 'name', 'email']),
        ]);
    }

    /**
     * Update the given user. A blank password leaves the current one untouched.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.index');
    }

    /**
     * Delete the given user, except the account currently signed in.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('You cannot delete your own account here.')]);

            return to_route('users.index');
        }

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return to_route('users.index');
    }
}
