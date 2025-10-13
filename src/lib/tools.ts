import { toolPaths } from '../tools/paths.js';

interface ToolDefinition {
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

interface ApiTool {
  function: (args: any) => Promise<any>;
  definition: {
    type: string;
    function: ToolDefinition['function'];
  };
  path: string;
}

/**
 * Discovers and loads available tools from the tools directory
 */
export async function discoverTools(): Promise<ApiTool[]> {
  const tools = await Promise.all(
    toolPaths.map(async (file) => {
      try {
        const module = await import(`../tools/${file}`);
        const apiTool = module.apiTool as Omit<ApiTool, 'path'>;
        return { ...apiTool, path: file };
      } catch (error) {
        console.error(`Failed to load tool: ${file}`, error);
        return null;
      }
    })
  );

  const validTools = tools.filter((tool): tool is ApiTool => {
    return tool !== null && tool.definition?.function?.name !== undefined;
  });

  // Deduplicate tool names
  const nameCounts: Record<string, number> = {};

  return validTools.map((tool) => {
    const name = tool.definition.function.name;

    nameCounts[name] = (nameCounts[name] || 0) + 1;

    if (nameCounts[name] > 1) {
      tool.definition.function.name = `${name}_${nameCounts[name]}`;
    }

    return tool;
  });
}
