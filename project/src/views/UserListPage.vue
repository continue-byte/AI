<script setup>
// 用户管理页：列表展示 + 新增/编辑弹窗 + 删除确认 + 角色分配 + 启用/禁用 + 分页
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { useUsersStore, ROLES, USER_STATUS } from "../stores/users.js";
import { useAuthStore } from "../stores/auth.js";

const usersStore = useUsersStore();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

onMounted(() => usersStore.init());

// ====== 统计卡片（Dashboard 概览，点击带筛选跳转）======
// 定义四张统计卡，key 对应 store.stats 的字段，filter 对应应用到用户列表的筛选条件
const statCards = [
  {
    key: "total",
    label: "总用户数",
    icon: "mdi:account-group-outline",
    color: "text-ink",
    filter: {},
  },
  {
    key: "admin",
    label: "管理员",
    icon: "mdi:shield-key-outline",
    color: "text-primary",
    filter: { role: "admin" },
  },
  {
    key: "disabled",
    label: "已禁用用户",
    icon: "mdi:account-off-outline",
    color: "text-red-500",
    filter: { status: "disabled" },
  },
  {
    key: "todayLogin",
    label: "今日登录",
    icon: "mdi:calendar-today-outline",
    color: "text-teal",
    filter: {},
  },
];

function onCardClick(card) {
  // 点击统计卡 → 刷新列表 + 自动应用筛选
  applyFilter(card.filter);
}

// ====== 筛选状态（与 URL query 同步，支持外部跳转带筛选条件）======
const roleFilter = ref("all"); // all / admin / user
const statusFilter = ref("all"); // all / active / disabled
const keyword = ref("");

// 初始化时读取 URL query（例如从 Dashboard 卡片点击跳转过来会带 ?role=admin）
onMounted(() => {
  if (route.query.role) roleFilter.value = route.query.role;
  if (route.query.status) statusFilter.value = route.query.status;
});

function applyFilter(filterObj) {
  if (filterObj.role) roleFilter.value = filterObj.role;
  if (filterObj.status) statusFilter.value = filterObj.status;
}

const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  return usersStore.list.filter((u) => {
    const matchKw =
      !kw ||
      u.username.toLowerCase().includes(kw) ||
      u.name.toLowerCase().includes(kw) ||
      (u.email || "").toLowerCase().includes(kw);
    const matchRole = roleFilter.value === "all" || u.role === roleFilter.value;
    const matchStatus =
      statusFilter.value === "all" || u.status === statusFilter.value;
    return matchKw && matchRole && matchStatus;
  });
});

// ====== 分页 ======
const pageSize = ref(10);
const currentPage = ref(1);

// 筛选条件变化时自动回到第一页
watch([keyword, roleFilter, statusFilter], () => {
  currentPage.value = 1;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / pageSize.value)),
);

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

// ====== 弹窗 & 表单 ======
const modalOpen = ref(false);
const modalMode = ref("add");
const modalLoading = ref(false);

const form = reactive({
  id: null,
  username: "",
  name: "",
  email: "",
  role: "user",
  status: "active",
});

const formErrors = reactive({ username: "", name: "", email: "" });

const deleteConfirmOpen = ref(false);
const deletingId = ref(null);

// ====== 表单校验 ======
function resetFormErrors() {
  formErrors.username = "";
  formErrors.name = "";
  formErrors.email = "";
}

function validate() {
  resetFormErrors();
  let ok = true;
  if (!form.username.trim()) {
    formErrors.username = "请输入账号";
    ok = false;
  } else {
    const dup = usersStore.list.find(
      (u) => u.username === form.username.trim() && u.id !== form.id,
    );
    if (dup) {
      formErrors.username = "该账号已存在";
      ok = false;
    }
  }
  if (!form.name.trim()) {
    formErrors.name = "请输入姓名";
    ok = false;
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    formErrors.email = "邮箱格式不正确";
    ok = false;
  }
  return ok;
}

// ====== 打开弹窗 ======
function openAdd() {
  modalMode.value = "add";
  form.id = null;
  form.username = "";
  form.name = "";
  form.email = "";
  form.role = "user";
  form.status = "active";
  resetFormErrors();
  modalOpen.value = true;
}

function openEdit(user) {
  modalMode.value = "edit";
  form.id = user.id;
  form.username = user.username;
  form.name = user.name;
  form.email = user.email || "";
  form.role = user.role;
  form.status = user.status || "active";
  resetFormErrors();
  modalOpen.value = true;
}

async function onSubmit() {
  if (!validate()) return;
  modalLoading.value = true;
  await new Promise((r) => setTimeout(r, 300));

  if (modalMode.value === "add") {
    usersStore.addUser({
      username: form.username.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
    });
  } else {
    usersStore.updateUser(form.id, {
      username: form.username.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
    });
  }
  modalLoading.value = false;
  modalOpen.value = false;
}

// ====== 删除 ======
function openDelete(id) {
  deletingId.value = id;
  deleteConfirmOpen.value = true;
}
function confirmDelete() {
  const ok = usersStore.deleteUser(deletingId.value, auth.currentUser?.id);
  if (ok) deleteConfirmOpen.value = false;
  // 失败（不能删自己）时 store.errorMsg 会显示在提示条
}

watch(
  () => deleteConfirmOpen.value,
  (v) => {
    if (v === false) deletingId.value = null;
    if (!usersStore.errorMsg) return;
    setTimeout(() => (usersStore.errorMsg = ""), 2500);
  },
);

// ====== 启用 / 禁用 ======
function toggleUserStatus(user) {
  // 不允许禁用自己
  if (user.id === auth.currentUser?.id && user.status === "active") {
    usersStore.errorMsg = "不能禁用当前登录的自己";
    setTimeout(() => (usersStore.errorMsg = ""), 2500);
    return;
  }
  usersStore.toggleStatus(user.id);
}

// ====== 辅助 ======
function roleClass(role) {
  return ROLES[role]?.color || "bg-gray-100 text-gray-500";
}
function roleLabel(role) {
  return ROLES[role]?.label || role;
}
function statusClass(s) {
  return USER_STATUS[s]?.color || "bg-gray-100 text-gray-500";
}
function statusLabel(s) {
  return USER_STATUS[s]?.label || s;
}
function isSelf(id) {
  return auth.currentUser?.id === id;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
</script>

<template>
  <div class="space-y-6">
    <!-- ① 统计概览卡片（Dashboard 入口，点击带筛选跳转）-->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <button
        v-for="card in statCards"
        :key="card.key"
        @click="onCardClick(card)"
        class="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
      >
        <span
          class="grid size-10 shrink-0 place-items-center rounded-xl bg-sand text-primary transition-colors group-hover:bg-primary group-hover:text-white"
        >
          <Icon :icon="card.icon" width="22" height="22" />
        </span>
        <div class="min-w-0">
          <p class="text-xs text-muted">{{ card.label }}</p>
          <p class="mt-0.5 text-2xl font-black" :class="card.color">
            {{ usersStore.stats[card.key] }}
          </p>
        </div>
      </button>
    </section>

    <!-- ② 用户管理卡片 -->
    <section class="rounded-2xl border border-gray-100 bg-white">
      <!-- 标题条 + 搜索 + 筛选 + 新增 -->
      <div
        class="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between md:p-5"
      >
        <div>
          <h2 class="text-lg font-semibold">用户管理</h2>
          <p class="mt-0.5 text-xs text-muted">
            新增、编辑、删除团队成员，启用/禁用账号，并为其分配角色。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <!-- 搜索 -->
          <div
            class="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus-within:border-primary"
          >
            <Icon
              icon="mdi:magnify"
              width="18"
              height="18"
              class="text-muted"
            />
            <input
              v-model="keyword"
              placeholder="搜索账号/姓名/邮箱"
              class="w-40 bg-transparent outline-none md:w-56"
            />
          </div>
          <!-- 角色筛选 -->
          <select
            v-model="roleFilter"
            class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">全部角色</option>
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
          </select>
          <!-- 状态筛选 -->
          <select
            v-model="statusFilter"
            class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">全部状态</option>
            <option value="active">正常</option>
            <option value="disabled">已禁用</option>
          </select>
          <!-- 新增按钮 -->
          <button
            @click="openAdd"
            class="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <Icon icon="mdi:plus" width="18" height="18" />
            新增用户
          </button>
        </div>
      </div>

      <!-- 错误提示条 -->
      <div
        v-if="usersStore.errorMsg"
        class="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 md:mx-5"
      >
        <Icon icon="mdi:alert-circle-outline" width="18" height="18" />
        {{ usersStore.errorMsg }}
      </div>

      <!-- 桌面端：表格 -->
      <div class="hidden md:block">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-muted">
            <tr>
              <th class="px-5 py-3 text-left font-medium">账号</th>
              <th class="px-5 py-3 text-left font-medium">姓名</th>
              <th class="px-5 py-3 text-left font-medium">邮箱</th>
              <th class="px-5 py-3 text-left font-medium">角色</th>
              <th class="px-5 py-3 text-left font-medium">状态</th>
              <th class="px-5 py-3 text-left font-medium">最后登录</th>
              <th class="px-5 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="u in paginatedList"
              :key="u.id"
              class="transition-colors hover:bg-sand/40"
              :class="u.status === 'disabled' ? 'opacity-60' : ''"
            >
              <td class="px-5 py-3 font-medium text-ink">
                <span class="flex items-center gap-2">
                  <span
                    class="grid size-7 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-white"
                    :class="
                      u.role === 'admin'
                        ? 'from-primary to-primary-dark'
                        : 'from-teal to-teal/70'
                    "
                    >{{ u.name[0] }}</span
                  >
                  {{ u.username }}
                </span>
              </td>
              <td class="px-5 py-3">{{ u.name }}</td>
              <td class="px-5 py-3 text-muted">{{ u.email || "—" }}</td>
              <td class="px-5 py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="roleClass(u.role)"
                  >{{ roleLabel(u.role) }}</span
                >
              </td>
              <td class="px-5 py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="statusClass(u.status)"
                  >{{ statusLabel(u.status) }}</span
                >
              </td>
              <td class="px-5 py-3 text-muted text-xs">
                {{ u.lastLoginAt || "—" }}
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <!-- 启用/禁用切换 -->
                  <button
                    @click="toggleUserStatus(u)"
                    :title="u.status === 'active' ? '禁用该用户' : '启用该用户'"
                    class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors hover:bg-sand"
                    :class="
                      u.status === 'active'
                        ? 'text-muted hover:text-red-500'
                        : 'text-teal hover:text-teal'
                    "
                  >
                    <Icon
                      :icon="
                        u.status === 'active'
                          ? 'mdi:account-off-outline'
                          : 'mdi:account-check-outline'
                      "
                      width="15"
                      height="15"
                    />
                    {{ u.status === "active" ? "禁用" : "启用" }}
                  </button>
                  <button
                    @click="openEdit(u)"
                    class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted transition-colors hover:bg-sand hover:text-primary"
                  >
                    <Icon
                      icon="mdi:pencil-outline"
                      width="15"
                      height="15"
                    />编辑
                  </button>
                  <button
                    :disabled="isSelf(u.id)"
                    :title="isSelf(u.id) ? '不能删除自己' : '删除'"
                    @click="openDelete(u.id)"
                    class="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-300"
                  >
                    <Icon
                      icon="mdi:trash-can-outline"
                      width="15"
                      height="15"
                    />删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredList.length === 0">
              <td colspan="7" class="px-5 py-12 text-center text-muted">
                <Icon
                  icon="mdi:account-off-outline"
                  width="40"
                  height="40"
                  class="mx-auto text-gray-300"
                />
                <p class="mt-2 text-sm">没有找到匹配的用户</p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页条（仅当总条数 > pageSize 时显示） -->
        <div
          v-if="filteredList.length > pageSize"
          class="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs text-muted"
        >
          <span
            >共 {{ filteredList.length }} 条，第 {{ currentPage }} /
            {{ totalPages }} 页</span
          >
          <div class="flex items-center gap-1">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="grid size-7 place-items-center rounded-md border border-gray-200 disabled:opacity-40 hover:border-primary/40"
            >
              <Icon icon="mdi:chevron-left" width="16" height="16" />
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              @click="currentPage = p"
              class="grid size-7 place-items-center rounded-md text-xs"
              :class="
                p === currentPage
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-sand'
              "
            >
              {{ p }}
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="grid size-7 place-items-center rounded-md border border-gray-200 disabled:opacity-40 hover:border-primary/40"
            >
              <Icon icon="mdi:chevron-right" width="16" height="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- 移动端：卡片列表 -->
      <div class="space-y-3 p-4 md:hidden">
        <article
          v-for="u in paginatedList"
          :key="u.id"
          class="rounded-xl border border-gray-100 p-4"
          :class="u.status === 'disabled' ? 'opacity-60' : ''"
        >
          <div class="flex items-center gap-3">
            <span
              class="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white"
              :class="
                u.role === 'admin'
                  ? 'from-primary to-primary-dark'
                  : 'from-teal to-teal/70'
              "
              >{{ u.name[0] }}</span
            >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="truncate font-semibold">{{ u.name }}</p>
                <span
                  class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="roleClass(u.role)"
                  >{{ roleLabel(u.role) }}</span
                >
                <span
                  class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="statusClass(u.status)"
                  >{{ statusLabel(u.status) }}</span
                >
              </div>
              <p class="truncate text-xs text-muted">
                {{ u.username }} · {{ u.email || "未设置邮箱" }}
              </p>
            </div>
          </div>
          <div
            class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs"
          >
            <span class="text-muted">最后登录：{{ u.lastLoginAt || "—" }}</span>
            <div class="flex items-center gap-2">
              <button
                @click="toggleUserStatus(u)"
                class="flex items-center gap-1 rounded-md px-2 py-1"
                :class="
                  u.status === 'active'
                    ? 'text-muted hover:text-red-500'
                    : 'text-teal'
                "
              >
                <Icon
                  :icon="
                    u.status === 'active'
                      ? 'mdi:account-off-outline'
                      : 'mdi:account-check-outline'
                  "
                  width="14"
                  height="14"
                />
                {{ u.status === "active" ? "禁用" : "启用" }}
              </button>
              <button
                @click="openEdit(u)"
                class="flex items-center gap-1 rounded-md px-2 py-1 text-primary"
              >
                <Icon icon="mdi:pencil-outline" width="14" height="14" />编辑
              </button>
              <button
                :disabled="isSelf(u.id)"
                @click="openDelete(u.id)"
                class="flex items-center gap-1 rounded-md px-2 py-1 text-red-500 disabled:text-gray-300"
              >
                <Icon icon="mdi:trash-can-outline" width="14" height="14" />删除
              </button>
            </div>
          </div>
        </article>
        <!-- 空数据态 -->
        <div
          v-if="filteredList.length === 0"
          class="rounded-xl border border-dashed py-12 text-center text-muted"
        >
          <Icon
            icon="mdi:account-off-outline"
            width="40"
            height="40"
            class="mx-auto text-gray-300"
          />
          <p class="mt-2 text-sm">没有找到匹配的用户</p>
        </div>

        <!-- 移动端分页 -->
        <div
          v-if="filteredList.length > pageSize"
          class="flex items-center justify-center gap-2 pt-2"
        >
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="rounded-md border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-40"
          >
            上一页
          </button>
          <span class="text-xs text-muted"
            >{{ currentPage }} / {{ totalPages }}</span
          >
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="rounded-md border border-gray-200 px-3 py-1.5 text-xs disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      </div>
    </section>

    <!-- ====== 新增 / 编辑弹窗 ====== -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-120 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="modalOpen"
          class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 backdrop-blur-sm"
          @click.self="modalOpen = false"
        >
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold">
                {{ modalMode === "add" ? "新增用户" : "编辑用户" }}
              </h3>
              <button
                @click="modalOpen = false"
                class="grid size-8 place-items-center rounded-md text-muted hover:bg-sand hover:text-primary"
              >
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>

            <form class="mt-5 space-y-4" @submit.prevent="onSubmit">
              <div>
                <label class="mb-1.5 block text-sm font-medium">账号</label>
                <input
                  v-model="form.username"
                  :disabled="modalMode === 'edit'"
                  placeholder="唯一登录账号"
                  class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
                />
                <p v-if="formErrors.username" class="mt-1 text-xs text-red-500">
                  {{ formErrors.username }}
                </p>
                <p
                  v-if="modalMode === 'edit'"
                  class="mt-1 text-[11px] text-muted"
                >
                  账号创建后不可修改
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium">姓名</label>
                <input
                  v-model="form.name"
                  placeholder="真实姓名或昵称"
                  class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                />
                <p v-if="formErrors.name" class="mt-1 text-xs text-red-500">
                  {{ formErrors.name }}
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium"
                  >邮箱（可选）</label
                >
                <input
                  v-model="form.email"
                  placeholder="用于发送通知"
                  class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                />
                <p v-if="formErrors.email" class="mt-1 text-xs text-red-500">
                  {{ formErrors.email }}
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium">角色</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    @click="form.role = 'admin'"
                    class="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all"
                    :class="
                      form.role === 'admin'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 text-muted hover:border-primary/40'
                    "
                  >
                    <Icon
                      icon="mdi:shield-key-outline"
                      width="18"
                      height="18"
                    />管理员
                  </button>
                  <button
                    type="button"
                    @click="form.role = 'user'"
                    class="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all"
                    :class="
                      form.role === 'user'
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray-200 text-muted hover:border-teal/40'
                    "
                  >
                    <Icon
                      icon="mdi:account-outline"
                      width="18"
                      height="18"
                    />普通用户
                  </button>
                </div>
              </div>

              <div v-if="modalMode === 'edit'">
                <label class="mb-1.5 block text-sm font-medium">账号状态</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    @click="form.status = 'active'"
                    class="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all"
                    :class="
                      form.status === 'active'
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray-200 text-muted hover:border-teal/40'
                    "
                  >
                    <Icon
                      icon="mdi:account-check-outline"
                      width="18"
                      height="18"
                    />正常
                  </button>
                  <button
                    type="button"
                    @click="form.status = 'disabled'"
                    class="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all"
                    :class="
                      form.status === 'disabled'
                        ? 'border-red-400 bg-red-50 text-red-500'
                        : 'border-gray-200 text-muted hover:border-red-300'
                    "
                  >
                    <Icon
                      icon="mdi:account-off-outline"
                      width="18"
                      height="18"
                    />已禁用
                  </button>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  @click="modalOpen = false"
                  class="rounded-lg border border-gray-200 px-4 py-2 text-sm text-muted hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  :disabled="modalLoading"
                  class="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
                >
                  {{
                    modalLoading
                      ? "保存中…"
                      : modalMode === "add"
                        ? "创建用户"
                        : "保存"
                  }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ====== 删除确认弹窗 ====== -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-120 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="deleteConfirmOpen"
          class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 backdrop-blur-sm"
          @click.self="deleteConfirmOpen = false"
        >
          <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-start gap-3">
              <span
                class="grid size-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-500"
              >
                <Icon icon="mdi:alert" width="22" height="22" />
              </span>
              <div class="flex-1">
                <h3 class="text-base font-bold">确认删除用户？</h3>
                <p class="mt-1 text-sm text-muted">
                  删除后该用户将无法登录，此操作不可撤销。
                </p>
              </div>
            </div>
            <div class="mt-5 flex items-center justify-end gap-2">
              <button
                @click="deleteConfirmOpen = false"
                class="rounded-lg border border-gray-200 px-4 py-2 text-sm text-muted hover:bg-gray-50"
              >
                取消
              </button>
              <button
                @click="confirmDelete"
                class="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
