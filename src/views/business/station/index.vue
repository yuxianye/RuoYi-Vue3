<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工位名称" prop="stationName">
        <el-input
          v-model="queryParams.stationName"
          placeholder="请输入工位名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工位编码" prop="stationCode">
        <el-input
          v-model="queryParams.stationCode"
          placeholder="请输入工位编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工位类型" prop="stationType">
        <el-select v-model="queryParams.stationType" placeholder="请选择工位类型" clearable>
          <el-option
            v-for="dict in station_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['business:station:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['business:station:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:station:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:station:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="stationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工位主键" align="center" prop="stationId" />
      <el-table-column label="工位名称" align="center" prop="stationName" />
      <el-table-column label="工位编码" align="center" prop="stationCode" />
      <el-table-column label="工位类型" align="center" prop="stationType">
        <template #default="scope">
          <dict-tag :options="station_type" :value="scope.row.stationType"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:station:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:station:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改工位对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="stationRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="工位名称" prop="stationName">
          <el-input v-model="form.stationName" placeholder="请输入工位名称" />
        </el-form-item>
        <el-form-item label="工位编码" prop="stationCode">
          <el-input v-model="form.stationCode" placeholder="请输入工位编码" />
        </el-form-item>
        <el-form-item label="工位类型" prop="stationType">
          <el-select v-model="form.stationType" placeholder="请选择工位类型">
            <el-option
              v-for="dict in station_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Station">
import { listStation, getStation, delStation, addStation, updateStation } from "@/api/business/station";

const { proxy } = getCurrentInstance();
const { station_type, sys_normal_disable } = proxy.useDict('station_type', 'sys_normal_disable');

const stationList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    stationName: null,
    stationCode: null,
    stationType: null,
    status: null,
  },
  rules: {
    stationName: [
      { required: true, message: "工位名称不能为空", trigger: "blur" }
    ],
    stationCode: [
      { required: true, message: "工位编码不能为空", trigger: "blur" }
    ],
    stationType: [
      { required: true, message: "工位类型不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询工位列表 */
function getList() {
  loading.value = true;
  listStation(queryParams.value).then(response => {
    stationList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    stationId: null,
    stationName: null,
    stationCode: null,
    stationType: null,
    status: "0",
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("stationRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.stationId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加工位";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _stationId = row.stationId || ids.value
  getStation(_stationId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改工位";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["stationRef"].validate(valid => {
    if (valid) {
      if (form.value.stationId != null) {
        updateStation(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStation(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _stationIds = row.stationId || ids.value;
  proxy.$modal.confirm('是否确认删除工位编号为"' + _stationIds + '"的数据项？').then(function() {
    return delStation(_stationIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/station/export', {
    ...queryParams.value
  }, `station_${new Date().getTime()}.xlsx`)
}

getList();
</script>
