import { config } from "https://deno.land/x/dotenv/mod.ts";

const { DATA_API_KEY, APP_ID } = config();

const BASE_URI =
  `https://data.mongodb-api.com/app/${APP_ID}/endpoint/data/v1/action`;
const DATA_SOURCE = "Cluster0";
const DATABASE = "todo_tb";
const COLLECTION = "todos";

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "api-key": DATA_API_KEY,
  },
  body: "",
};

const base_query = {
  collection: COLLECTION,
  database: DATABASE,
  dataSource: DATA_SOURCE,
};

export const addTodo = async (
  { request, response }: { request: any; response: any },
) => {
  try {
    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        message: "No data was provided!",
      };
    } else {
      const body = await request.body();
      const todo = await body.value;
      console.log(todo);

      const URI = `${BASE_URI}/insertOne`;
      const query = {
        ...base_query,
        document: todo,
      };

      options.body = JSON.stringify(query);
      const dataResponse = await fetch(URI, options);
      if (dataResponse.ok) {
        const { insertedId } = await dataResponse.json();
        response.status = 201;
        response.body = {
          success: true,
          data: todo,
          insertedId,
        };
      } else {
        response.status = dataResponse.status;
        response.body = {
          success: false,
          message: dataResponse.statusText,
        };
      }
    }
  } catch (error) {
    response.body = {
      success: false,
      message: error.toString(),
    };
  }
};

export const getTodos = async ({ response }: { response: any }) => {
  try {
    const URI = `${BASE_URI}/find`;
    const query = {
      ...base_query,
    };

    options.body = JSON.stringify(query);
    const dataResponse = await fetch(URI, options);
    const allTodos = await dataResponse.json();
    console.log(allTodos);

    if (allTodos.documents.length === 0) {
      response.status = 404;
      response.body = {
        success: false,
        data: "No todos found",
      };
    } else {
      response.status = 200;
      response.body = {
        success: true,
        data: allTodos.documents,
      };
    }
  } catch (error) {
    response.body = {
      success: false,
      message: error.toString(),
    };
  }
};

export const getTodo = async ({
  params,
  response,
}: {
  params: { id: string };
  response: any;
}) => {
  const URI = `${BASE_URI}/findOne`;
  const query = {
    ...base_query,
    filter: { id: parseInt(params.id) },
  };

  options.body = JSON.stringify(query);
  const dataResponse = await fetch(URI, options);

  const todo = await dataResponse.json();

  if (!todo.document) {
    response.status = 404;
    response.body = {
      success: false,
      message: "No todo found",
    };
  } else {
    response.status = 200;
    response.body = {
      success: true,
      data: todo.document,
    };
  }
};

export const getIncompleteTodos = async ({ response }: { response: any }) => {
  const URI = `${BASE_URI}/aggregate`;
  const pipeline = [
    {
      $match: {
        complete: false
      }
    },
    {
      $count: 'incomplete'
    }
  ];

  const query = {
    ...base_query,
    pipeline
  }

  options.body = JSON.stringify(query);
  const dataResponse = await fetch(URI, options);
  const incompleteCount = await dataResponse.json();
  console.log(incompleteCount);
  if (incompleteCount.documents[0].incomplete) {
    response.status = 200;
    response.body = {
      success: true,
      incompleteCount
    }
  } else {
    response.status = 404;
    response.body = {
      success: false,
      message: `No incomplete todos found.`
    }
  }
}

export const updateTodo = async ({
  params,
  request,
  response,
}: {
  params: { id: string };
  request: any;
  response: any;
}) => {
  try {
    const body = await request.body();
    const { title, complete } = await body.value;
    const URI = `${BASE_URI}/updateOne`;
    const query = {
      ...base_query,
      filter: {
        id: parseInt(params.id),
      },
      update: {
        $set: { title, complete },
      },
    };

    options.body = JSON.stringify(query);
    const dataResponse = await fetch(URI, options);
    const todoUpdated = await dataResponse.json();
    console.log(todoUpdated);

    if (todoUpdated.modifiedCount) {
      response.status = 200;
      response.body = {
        success: true,
        data: todoUpdated,
      };
    } else {
      response.status = 404;
      response.body = {
        success: false,
        message: `No todo found for this id ${params.id}`,
      };
    }
  } catch (error) {
    response.body = {
      success: false,
      message: error.toString(),
    };
  }
};

export const deleteTodo = async (
  { params, response }: { params: { id: string }; response: any },
) => {
  try {
    const URI = `${BASE_URI}/deleteOne`;
    const query = {
      ...base_query,
      filter: {
        id: parseInt(params.id)
      }
    }
    options.body = JSON.stringify(query);
    const dataResponse = await fetch(URI, options);
    const deletedTodo = await dataResponse.json();
    console.log(deletedTodo);
    if (deletedTodo.deletedCount) {
      response.status = 201;
      response.body = {
        success: true,
        deleteTodo
      }
    } else {
      response.status = 404;
      response.body = {
        success: false,
        message: `No todo found for this id ${params.id}`
      }
    }
  } catch (error) {
    response.body = {
      success: false,
      message: error.toString()
    }
  }
};
