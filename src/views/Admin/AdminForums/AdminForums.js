import { generateClient } from 'aws-amplify/data';

const client = generateClient();

function sortByOrder(items = []) {
  return [...items].sort((a, b) => {
    const aOrder = a.sortOrder ?? 0;
    const bOrder = b.sortOrder ?? 0;
    return aOrder - bOrder;
  });
}

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const emptyCategoryForm = () => ({
  id: '',
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
  isActive: true,
});

const emptyBoardForm = () => ({
  id: '',
  categoryId: '',
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
  isActive: true,
});

export default {
  name: 'AdminForums',

  data() {
    return {
      loading: true,
      saving: false,
      loadError: '',
      saveMessage: '',
      formMode: 'board',
      editorIntent: 'create',
      categories: [],
      boards: [],
      threads: [],
      categoryForm: emptyCategoryForm(),
      boardForm: emptyBoardForm(),
    };
  },

  computed: {
    forumSections() {
      const sortedCategories = sortByOrder(this.categories);

      return sortedCategories.map((category) => {
        const boards = sortByOrder(
          this.boards.filter((board) => board.categoryId === category.id),
        ).map((board) => ({
          ...board,
          threadCount: this.threads.filter((thread) => thread.boardId === board.id).length,
        }));

        return {
          ...category,
          boards,
        };
      });
    },

    isEditingCategory() {
      return this.formMode === 'category' && !!this.categoryForm.id;
    },

    isEditingBoard() {
      return this.formMode === 'board' && !!this.boardForm.id;
    },

    editorTitle() {
      if (this.formMode === 'category') {
        return this.isEditingCategory ? 'Edit Category' : 'Create Category';
      }

      return this.isEditingBoard ? 'Edit Board' : 'Create Board';
    },

    editorSubtitle() {
      if (this.formMode === 'category') {
        return this.isEditingCategory
          ? 'Update the selected forum category.'
          : 'Create a new forum category for your board structure.';
      }

      const selectedCategory = this.categories.find(
        (category) => category.id === this.boardForm.categoryId,
      );

      if (this.isEditingBoard) {
        return 'Update the selected discussion board.';
      }

      if (selectedCategory) {
        return `Create a new board inside ${selectedCategory.name}.`;
      }

      return 'Create a new discussion board.';
    },
  },

  async mounted() {
    await this.fetchForumStructure();
  },

  methods: {
    async fetchForumStructure() {
      this.loading = true;
      this.loadError = '';
      this.saveMessage = '';

      try {
        const [categoryResult, boardResult, threadResult] = await Promise.all([
          client.models.ForumCategory.list(),
          client.models.ForumBoard.list(),
          client.models.ForumThread.list(),
        ]);

        if (categoryResult.errors?.length) {
          throw new Error(categoryResult.errors[0].message || 'Failed to load categories');
        }

        if (boardResult.errors?.length) {
          throw new Error(boardResult.errors[0].message || 'Failed to load boards');
        }

        if (threadResult.errors?.length) {
          throw new Error(threadResult.errors[0].message || 'Failed to load threads');
        }

        this.categories = categoryResult.data || [];
        this.boards = boardResult.data || [];
        this.threads = threadResult.data || [];

        if (!this.boardForm.categoryId && this.categories.length) {
          this.boardForm.categoryId = this.categories[0].id;
        }
      } catch (error) {
        console.error('Failed to fetch forum structure:', error);
        this.loadError = error?.message || 'Failed to load forum structure';
      } finally {
        this.loading = false;
      }
    },

    focusEditorField(refName) {
      this.$nextTick(() => {
        const target = this.$refs[refName];
        const element = Array.isArray(target) ? target[0] : target;

        if (element?.focus) {
          element.focus();
        }

        if (element?.scrollIntoView) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },

    openCreateCategory() {
      this.formMode = 'category';
      this.editorIntent = 'create';
      this.loadError = '';
      this.saveMessage = '';
      this.categoryForm = {
        ...emptyCategoryForm(),
        sortOrder: this.categories.length,
      };
      this.focusEditorField('categoryNameInput');
    },

    openCreateBoard(categoryId = '') {
      this.formMode = 'board';
      this.editorIntent = 'create';
      this.loadError = '';
      this.saveMessage = '';

      const defaultCategoryId = categoryId || this.categories[0]?.id || '';
      const categoryBoards = this.boards.filter(
        (board) => board.categoryId === defaultCategoryId,
      );

      this.boardForm = {
        ...emptyBoardForm(),
        categoryId: defaultCategoryId,
        sortOrder: categoryBoards.length,
      };

      this.focusEditorField('boardNameInput');
    },

    editCategory(category) {
      this.formMode = 'category';
      this.editorIntent = 'edit';
      this.loadError = '';
      this.saveMessage = '';
      this.categoryForm = {
        id: category.id,
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        sortOrder: category.sortOrder ?? 0,
        isActive: category.isActive !== false,
      };
      this.focusEditorField('categoryNameInput');
    },

    editBoard(board) {
      this.formMode = 'board';
      this.editorIntent = 'edit';
      this.loadError = '';
      this.saveMessage = '';
      this.boardForm = {
        id: board.id,
        categoryId: board.categoryId || '',
        name: board.name || '',
        slug: board.slug || '',
        description: board.description || '',
        sortOrder: board.sortOrder ?? 0,
        isActive: board.isActive !== false,
      };
      this.focusEditorField('boardNameInput');
    },

    resetForms() {
      this.loadError = '';
      this.saveMessage = '';
      this.editorIntent = 'create';
      this.categoryForm = emptyCategoryForm();
      this.boardForm = {
        ...emptyBoardForm(),
        categoryId: this.categories[0]?.id || '',
      };
      this.formMode = 'board';
      this.focusEditorField('boardNameInput');
    },

    async submitCategory() {
      this.saving = true;
      this.loadError = '';
      this.saveMessage = '';

      try {
        const payload = {
          name: this.categoryForm.name.trim(),
          slug: slugify(this.categoryForm.slug || this.categoryForm.name),
          description: this.categoryForm.description.trim(),
          sortOrder: Number(this.categoryForm.sortOrder) || 0,
          isActive: this.categoryForm.isActive === true,
        };

        let result;

        if (this.categoryForm.id) {
          result = await client.models.ForumCategory.update({
            id: this.categoryForm.id,
            ...payload,
          });
        } else {
          result = await client.models.ForumCategory.create(payload);
        }

        if (result.errors?.length) {
          throw new Error(result.errors[0].message || 'Failed to save category');
        }

        this.saveMessage = this.categoryForm.id
          ? 'Category updated successfully.'
          : 'Category created successfully.';

        await this.fetchForumStructure();
        this.resetForms();
      } catch (error) {
        console.error('Failed to save category:', error);
        this.loadError = error?.message || 'Failed to save category';
      } finally {
        this.saving = false;
      }
    },

    async submitBoard() {
      this.saving = true;
      this.loadError = '';
      this.saveMessage = '';

      try {
        if (!this.boardForm.categoryId) {
          throw new Error('Please choose a category for this board.');
        }

        const payload = {
          categoryId: this.boardForm.categoryId,
          name: this.boardForm.name.trim(),
          slug: slugify(this.boardForm.slug || this.boardForm.name),
          description: this.boardForm.description.trim(),
          sortOrder: Number(this.boardForm.sortOrder) || 0,
          isActive: this.boardForm.isActive === true,
        };

        let result;

        if (this.boardForm.id) {
          result = await client.models.ForumBoard.update({
            id: this.boardForm.id,
            ...payload,
          });
        } else {
          result = await client.models.ForumBoard.create(payload);
        }

        if (result.errors?.length) {
          throw new Error(result.errors[0].message || 'Failed to save board');
        }

        this.saveMessage = this.boardForm.id
          ? 'Board updated successfully.'
          : 'Board created successfully.';

        await this.fetchForumStructure();
        this.resetForms();
      } catch (error) {
        console.error('Failed to save board:', error);
        this.loadError = error?.message || 'Failed to save board';
      } finally {
        this.saving = false;
      }
    },

    async confirmDeleteCategory(category) {
      const categoryBoards = this.boards.filter((board) => board.categoryId === category.id);

      if (categoryBoards.length) {
        this.loadError =
          'This category still has boards inside it. Move or delete those boards first.';
        return;
      }

      const confirmed = window.confirm(
        `Delete category "${category.name}"? This cannot be undone.`,
      );

      if (!confirmed) return;

      try {
        const result = await client.models.ForumCategory.delete({ id: category.id });

        if (result.errors?.length) {
          throw new Error(result.errors[0].message || 'Failed to delete category');
        }

        this.saveMessage = 'Category deleted successfully.';
        await this.fetchForumStructure();
      } catch (error) {
        console.error('Failed to delete category:', error);
        this.loadError = error?.message || 'Failed to delete category';
      }
    },

    async confirmDeleteBoard(board) {
      const boardThreads = this.threads.filter((thread) => thread.boardId === board.id);

      if (boardThreads.length) {
        this.loadError =
          'This board still has threads inside it. Archive or remove those threads first.';
        return;
      }

      const confirmed = window.confirm(
        `Delete board "${board.name}"? This cannot be undone.`,
      );

      if (!confirmed) return;

      try {
        const result = await client.models.ForumBoard.delete({ id: board.id });

        if (result.errors?.length) {
          throw new Error(result.errors[0].message || 'Failed to delete board');
        }

        this.saveMessage = 'Board deleted successfully.';
        await this.fetchForumStructure();
      } catch (error) {
        console.error('Failed to delete board:', error);
        this.loadError = error?.message || 'Failed to delete board';
      }
    },
  },
};